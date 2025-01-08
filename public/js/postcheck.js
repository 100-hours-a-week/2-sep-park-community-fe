// 상세 게시글 조회 API
//댓글 작성,수정,삭제 API
//게시글 수정, 삭제 API
//import { API_URL } from '../../app.js';
import API_URL from './config.js';
document.addEventListener('DOMContentLoaded', async () => {
    const postComments = document.getElementById('postComments'); // 댓글 등록 버튼
    const commentText = document.getElementById('commentText'); // 댓글 input

    // 세션 데이터 가져오기
    let currentUserId = null;
    try {
        const response = await fetch(`${API_URL}/auth/session`, {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
        });

        if (response.ok) {
            const data = await response.json();
            currentUserId = data.user.userId; // 세션에서 userId 가져오기
            console.log(currentUserId);

        } else {
            console.error('세션 정보를 가져오지 못했습니다.');
        }
    } catch (error) {
        console.error('세션 요청 중 오류 발생:', error);
    }
    // 현재 URL 경로에서 postId 추출
    const pathname = window.location.pathname; // 예: "/posts/1"
    const match = pathname.match(/\/posts\/(\d+)/); // 정규식으로 postId 추출

// postId 추출 여부 확인
    const postId = match ? match[1] : null;

    // 게시글 조회 (랜더링)
    fetch(`${API_URL}/posts/${postId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: "include",
    })
        .then(handleResponse)
        .then((data) => {
            console.log(data); // 반환된 데이터의 실제 구조 확인
            const post = data.post;
            const postContainer = document.querySelector('.post');
            postContainer.innerHTML = `
            <div class="post">
                <div class="box">
                    <div class="titletext"><div id="titleText">${post.title}</div>
                        <div class="info">
                            <div class="author">
                                <img src="${post.profileImage}" alt="작성자 이미지">
                                <div id="authorContent">${post.author}</div>
                            </div>
                            <div class="date" >${post.dateAt}</div>
                            <div class="minibtns">
                            ${
                                 post.userId === currentUserId
                                     ? `<div class="minibtn modify-btn" id="postModifyBtn" data-post-id="${post.id}">수정</div>
                                        <div class="minibtn delete-btn" id="postDeleteBtn" data-post-id="${post.id}">삭제</div>`
                                    : ""
                            }   
                            </div>
                        </div>
                    </div>
                </div>
                <div class="imgContainer"><img  id="postImg" src="${post.postImagePath}"></div>
                <div class="textContainer">${post.content}</div>
            </div>
            <div class="clickBtn">
                        <div class="views like-btn" id="likeBtn" data-post-id="postId">
                            <div class="count" id="likeContainer">
                            <span id="likeCount">${post.likeCount}</span>
                            </div>
                            좋아요 수 
                        </div>
                        <div class="views">
                            <div class="count">${post.viewCount}</div>
                            조회수
                        </div>
                        <div class="views">
                            <div class="count">${post.commentCount}</div>
                            댓글
                        </div>
                    </div>
        `;
            const likeContainer = document.getElementById('likeBtn');

            if (likeContainer) {
                likeContainer.addEventListener('click', () => {
                    console.log('좋아요 클릭!1');
                });
            } else {
                console.error('likeContainer 요소를 찾을 수 없습니다.');
            }
            document.body.addEventListener('click', async (e) => {
                const likeBtn = e.target.closest('.like-btn'); // 클릭된 요소에서 가장 가까운 like-btn 확인
                if (likeBtn) {
                    e.preventDefault();
                    console.log("좋아요 버튼 클릭, postId:", postId);

                    const likeCountElement = likeBtn.querySelector("#likeCount");
                    if (!likeCountElement) {
                        console.error("좋아요 숫자를 표시할 요소를 찾을 수 없습니다.");
                        return;
                    }

                    try {
                        const response = await fetch(`${API_URL}/posts/${postId}/like/likeCheck`, {
                            method: "GET",
                            mode: "cors",
                            credentials: "include",
                        });

                        if (response.ok) {
                            const { isLiked } = await response.json();

                            if (isLiked) {
                                const deleteResponse = await fetch(`${API_URL}/posts/${postId}/like`, {
                                    method: "DELETE",
                                    mode: "cors",
                                    credentials: "include",
                                });

                                if (deleteResponse.ok) {
                                    console.log("좋아요 취소 완료");
                                    likeCountElement.innerText = parseInt(likeCountElement.innerText, 10) - 1;
                                }
                            } else {
                                const postResponse = await fetch(`${API_URL}/posts/${postId}/like`, {
                                    method: "GET",
                                    mode: "cors",
                                    credentials: "include",
                                });

                                if (postResponse.ok) {
                                    console.log("좋아요 추가 완료");
                                    likeCountElement.innerText = parseInt(likeCountElement.innerText, 10) + 1;
                                }
                            }
                        }
                    } catch (error) {
                        console.error("네트워크 오류 발생:", error);
                    }
                }
            });






            // 이미지가 없는 경우 imgContainer 숨김
            const imgElement = document.getElementById('postImg');
            if (!post.postImagePath || post.postImagePath.trim() === '') {
                imgElement.closest('.imgContainer').style.display = 'none';




            }
            // 이미지 컨테이너 추가
            if (post.postImagePath) {
                const imgContainer = document.createElement('div');
                imgContainer.className = 'imgContainer';
                imgContainer.innerHTML = `<img src="${post.postImagePath}" alt="게시글 이미지">`;
                imgElement.appendChild(imgContainer);
            }

            // 수정 버튼 클릭 이벤트 추가
            const postModifyBtn = document.getElementById('postModifyBtn');
            if (postModifyBtn) {
                postModifyBtn.addEventListener('click', () => {
                    window.location.href = `/editpost/${postId}`;
                });
            }

            // 게시글 삭제 버튼 클릭 이벤트 추가
            const postDeleteBtn = document.getElementById('postDeleteBtn');
            if (postDeleteBtn) {
                postDeleteBtn.addEventListener('click', () => {
                    const postModal = document.getElementById('postModal');
                    if (postModal) {
                        postModal.classList.remove('hidden'); // 모달 열기
            const postCloseBtn = document.getElementById('postCloseBtn');
                    if (postCloseBtn) {
                        postCloseBtn.addEventListener('click', () => {
                            postModal.classList.add('hidden');
                        })
                    }
                        // 모달 확인 버튼 클릭 시 삭제 처리
                        const postDeleteCheckBtn = document.getElementById('postDeleteCheckBtn');
                        if (postDeleteCheckBtn) {
                            postDeleteCheckBtn.addEventListener('click', () => {
                                fetch(`${API_URL}/posts/${postId}`, {
                                    method: 'DELETE',
                                    credentials: 'include',
                                })
                                    .then(handleResponse)
                                    .then(() => {
                                        alert('게시글이 성공적으로 삭제되었습니다.');
                                        window.location.href = '/posts'; // 게시글 목록 페이지로 이동
                                    })
                                    .catch(console.error)
                                    .finally(() => {
                                        postModal.classList.add('hidden'); // 모달 닫기
                                    });
                            });
                        }
                    }
                });
            }
        })
        .catch(console.error);



    // 댓글 랜더링
    fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'GET',
        mode: 'cors',
        credentials: "include",
        headers: {
            'Content-Type': 'application/json',
        },
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('댓글 조회에 실패했습니다.');
            }
            return response.json();
        })
        .then((data) => {
            const comments = data.data.comments; // 서버에서 받은 댓글 데이터
            console.log("유저 정보:", data);
            const commentsContainer = document.querySelector('.commentsContainer');

            // 기존 댓글 초기화
            commentsContainer.innerHTML = '';

            // 댓글 데이터로 HTML 생성
            comments.forEach((comment) => {
                const commentElement = createCommentElement(comment); // DOM 생성 함수 활용
                commentsContainer.appendChild(commentElement); // 댓글 추가
            });
        })
        .catch((err) => {
            console.error("에러 발생:", err.message);
        });


// 댓글 삭제 이벤트 위임
    document.body.addEventListener('click', (e) => {
        const deleteBtn = e.target.closest('.delete-btn');
        if (deleteBtn && deleteBtn.dataset.id) {
            const commentId = deleteBtn.dataset.id;
            console.log(`댓글 삭제 버튼 클릭: ${commentId}`);

            // 댓글 삭제 확인 모달 열기
            const commentModal = document.getElementById('commentModal');
            if (commentModal) {
                commentModal.classList.remove('hidden');

                // 모달 닫기 버튼
                const commentCloseBtn = document.getElementById('commentCloseBtn');
                commentCloseBtn?.addEventListener('click', () => {
                    commentModal.classList.add('hidden');
                }, { once: true }); // 이벤트 중복 방지

                // 모달 확인 버튼
                const commentDeleteCheckBtn = document.getElementById('commentDeleteCheckBtn');
                commentDeleteCheckBtn?.addEventListener('click', async () => {
                    try {
                        const response = await fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
                            method: 'DELETE',
                            credentials: 'include',
                        });

                        if (response.ok) {
                            console.log(`댓글 ${commentId} 삭제 성공`);

                            // DOM에서 댓글 제거
                            const commentElement = document.querySelector(`[data-id="${commentId}"]`);
                            if (commentElement) {
                                commentElement.remove(); // DOM에서 댓글 삭제
                            }

                            alert('댓글이 성공적으로 삭제되었습니다.');
                        } else {
                            const error = await response.json();
                            console.error("댓글 삭제 실패:", error);
                            alert(error.message || "댓글 삭제에 실패했습니다. 다시 시도해주세요.");
                        }
                    } catch (err) {
                        console.error("댓글 삭제 중 오류 발생:", err);
                        alert("댓글 삭제 중 문제가 발생했습니다. 다시 시도해주세요.");
                    } finally {
                        commentModal.classList.add('hidden'); // 모달 닫기
                    }
                }, { once: true }); // 이벤트 중복 방지
            }
        }
    });







    let isEditing = false; // 수정 상태 여부
    let editingCommentId = null; // 현재 수정 중인 댓글의 ID 저장

// 댓글 수정 버튼 클릭 시 동작
    document.body.addEventListener('click', (e) => {
        const modifyBtn = e.target.closest('.modify-btn');
        if (modifyBtn) {
            const commentId = modifyBtn.getAttribute('data-id'); // 댓글 ID
            const commentElement = document.querySelector(`[data-id="${commentId}"]`);
            const contentElement = commentElement.querySelector('.comment-content');

            if (contentElement) {
                const currentContent = contentElement.textContent.trim();
                commentText.value = currentContent; // 입력창에 기존 내용 표시
                isEditing = true;
                editingCommentId = commentId;
                postComments.textContent = "댓글 수정"; // 버튼 텍스트 변경
            }
        }
    });

    postComments.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            if (!commentText) {
                console.error("댓글 입력 필드를 찾을 수 없습니다.");
                alert("댓글 입력 필드가 없습니다.");
                return;
            }

            const commentContent = commentText.value.trim(); // 댓글 내용 가져오기

            if (!commentContent) {
                alert("댓글 내용을 입력해주세요!");
                return;
            }

            if (isEditing && editingCommentId) {
                // 수정 상태일 때 PUT 요청
                try {
                    const response = await fetch(`${API_URL}/posts/${postId}/comments/${editingCommentId}`, {
                        method: 'PUT',
                        mode: 'cors',
                        credentials: "include",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ text: commentContent }),
                    });

                    if (response.ok) {
                        const responseData = await response.json();
                        const updatedComment = responseData.comment;

                        console.log("수정된 댓글 데이터:", updatedComment);

                        // DOM에서 댓글 업데이트
                        const commentElement = document.querySelector(`[data-id="${editingCommentId}"]`);
                        if (commentElement) {
                            const contentElement = commentElement.querySelector('.comment-content');
                            if (contentElement) {
                                contentElement.textContent = updatedComment.content; // 수정된 내용 반영
                            }

                            const authorElement = commentElement.querySelector('#authorContent');
                            if (authorElement) {
                                authorElement.textContent = updatedComment.author; // 작성자 이름 업데이트
                            }

                            const profileImageElement = commentElement.querySelector('.author img');
                            if (profileImageElement) {
                                profileImageElement.src = updatedComment.profile_image || '/img/default-profile.png'; // 프로필 이미지 업데이트
                            }
                        }

                        // 수정 상태 초기화
                        isEditing = false;
                        editingCommentId = null;
                        commentText.value = '';
                        postComments.textContent = "댓글 등록"; // 버튼 텍스트 초기화

                        alert("댓글 수정 성공!");
                    } else {
                        const errorData = await response.json();
                        console.error("댓글 수정 실패:", errorData);
                        alert("댓글 수정에 실패했습니다.");
                    }
                } catch (err) {
                    console.error("댓글 수정 중 오류 발생:", err);
                    alert("댓글 수정 중 문제가 발생했습니다. 다시 시도해주세요.");
                }
            } else {
                // 댓글 작성 상태일 때 POST 요청
                try {
                    const response = await fetch(`${API_URL}/posts/${postId}/comments`, {
                        method: 'POST',
                        mode: 'cors',
                        credentials: "include",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ text: commentContent }),
                    });

                    if (response.ok) {
                        const newComment = await response.json();
                        console.log("작성된 댓글 데이터:", newComment);

                        // 댓글 DOM 추가
                        const commentsContainer = document.querySelector('.commentsContainer');
                        const commentElement = createCommentElement(newComment.comment); // 수정: newComment.comment 사용
                        commentsContainer.insertBefore(commentElement, commentsContainer.firstChild);
                        commentText.value = '';
                        alert("댓글 작성 성공!");
                    } else {
                        const errorData = await response.json();
                        console.error("댓글 작성 실패:", errorData);
                        alert("댓글 작성에 실패했습니다.");
                    }
                } catch (err) {
                    console.error("댓글 작성 중 오류 발생:", err);
                    alert("댓글 작성 중 문제가 발생했습니다. 다시 시도해주세요.");
                }
            }
        } catch (err) {
            console.error("전반적인 처리 중 오류 발생:", err);
            alert("댓글 처리 중 문제가 발생했습니다. 잠시 후 다시 시도해주세요.");
        }
    });


// 댓글 DOM 추가 함수 수정
    function createCommentElement(comment) {
        const isCurrentUser = comment.userId === currentUserId;
        const commentElement = document.createElement('div');
        commentElement.classList.add('commentsList');
        commentElement.setAttribute('data-id', comment.commentId);

        commentElement.innerHTML = `
        <div class="comment">
            <div class="info">
                <div class="author">
                    <img src="${comment.profile_image || '/img/default-profile.png'}" alt="작성자 이미지">
                    <div id="authorContent">${comment.author || '익명'}</div>
                </div>
                <div class="date">${comment.dateAt || '방금 전'}</div>
                <div class="minibtns"> 
                    ${
            isCurrentUser
                ? `<div class="minibtn modify-btn" data-id="${comment.commentId}">수정</div>
                               <div class="minibtn delete-btn" data-id="${comment.commentId}">삭제</div>`
                : `<div class="placeholder"></div>`
        }
                </div>
            </div>
            <div class="bottom">
                <div class="comment-content">${comment.content || '내용 없음'}</div>
            </div>
        </div>
    `;
        return commentElement;
    }






// 공통 응답 처리 함수
    function handleResponse(response) {
        if (response.status === 401) {
            alert("사용자 인증이 필요합니다. 다시 로그인해주세요.");
            window.location.href = "/";
            return;
        }
        if (response.status === 403) {
            alert("권한이 없습니다.");
            throw new Error("403 Forbidden");
        }
        if (response.status === 404) {
            alert("리소스를 찾을 수 없습니다.");
            throw new Error("404 Not Found");
        }
        if (!response.ok) {
            alert("요청 처리에 실패했습니다.");
            throw new Error("요청 실패");
        }
        return response.json();
    }


});
