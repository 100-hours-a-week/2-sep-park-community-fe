// 상세 게시글 조회 API
//댓글 작성,수정,삭제 API
//게시글 수정, 삭제 API
//import { API_URL } from '../../app.js';
import API_URL from './config.js';
document.addEventListener('DOMContentLoaded', async () => {
    const postComments = document.getElementById('postComments');
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



    // 댓글 조회 (랜더링)
    fetch(`${API_URL}/posts/${postId}/comments`, {
        method: 'GET',
        mode: 'cors',
        credentials: "include", // 쿠키 포함
        headers: {
            'Content-Type': 'application/json',
        },
    })

        .then((response) => {
            if (!response.ok) {
                throw new Error('댓글 조회에 실패했습니다.');
            }
            return response.json(); // 응답 데이터를 JSON으로 변환
        })
        .then((data) => {
            const comments = data.data.comments; // 서버에서 받은 댓글 데이터
            console.log("유저 정보:", data);
            const commentsContainer = document.querySelector('.commentsContainer'); // 댓글 리스트 컨테이너

            // 기존 댓글 초기화
            commentsContainer.innerHTML = '';

            // 댓글 데이터로 HTML 생성
            comments.forEach((comment) => {
                const isCurrentUser = comment.userId === currentUserId;
                const commentElement = document.createElement('div');
                commentElement.classList.add('commentsList');

                commentElement.innerHTML = `
            
                <div class="comment">
                <div class="info">
                    <div class="author">
                        <img src="${comment.profile_image || '/img/default-profile.png'}" alt="작성자 이미지">
                        <div id="authorContent">${comment.author || '익명'}</div>
                    </div>
                    <div class="date">${comment.dateAt}</div>
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
                    <div class="comment-content">${comment.content}</div>
                </div>
                </div>
             
            `;

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

            const commentCloseBtn = document.getElementById('commentCloseBtn');
            if (commentCloseBtn) {
                commentCloseBtn.addEventListener('click', () => {
               commentModal.classList.add('hidden');
               });
                }
                // 모달 확인 버튼 클릭 시 댓글 삭제 처리
                const commentDeleteCheckBtn = document.getElementById('commentDeleteCheckBtn');
                if (commentDeleteCheckBtn) {
                    commentDeleteCheckBtn.addEventListener('click', () => {
                        fetch(`${API_URL}/posts/${postId}/comments/${commentId}`, {
                            method: 'DELETE',
                            credentials: 'include',
                        })
                            .then(handleResponse)
                            .then(() => {
                                alert('댓글이 성공적으로 삭제되었습니다.');
                                location.reload();

                            })
                            .catch(console.error);
                        commentModal.classList.add('hidden'); // 모달 닫기
                    });
                }
            }
        }
    });







    let isEditing = false; // 수정 상태 여부
    let editingCommentId = null; // 현재 수정 중인 댓글의 ID 저장

// 댓글 수정 버튼 클릭 시 동작
    document.body.addEventListener('click', async (e) => {
        if (e.target.classList.contains('modify-btn')) {
            const commentId = e.target.getAttribute('data-id'); // 수정하려는 댓글 ID
            const commentElement = e.target.closest('.comment'); // 해당 댓글 DOM 요소
            const contentElement = commentElement.querySelector('.comment-content'); // 기존 댓글 내용

            // 수정 상태로 전환
            isEditing = true;
            editingCommentId = commentId;
            console.log("editingCommentId:", editingCommentId);


            // 댓글 입력창에 기존 내용 설정
            commentText.value = contentElement.textContent.trim();

            // "댓글 등록" 버튼을 "댓글 수정"으로 변경
            postComments.textContent = "댓글 수정";
        }
    });

// 댓글 작성 및 수정 버튼 클릭 시 동작
    postComments.addEventListener('click', async (e) => {
        e.preventDefault();

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
                const updatedComment = await response.json();
                console.log("수정된 댓글 데이터:", updatedComment);
                alert("댓글 수정 성공!");
                window.location.reload();
            }
        } else {
            // 댓글 작성 상태일 때 POST 요청
            fetch(`${API_URL}/posts/${postId}/comments`, {
                method: 'POST',
                mode: 'cors',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: commentContent }),
            })
                .then((data) => {
                    console.log("작성된 댓글:", data);
                        location.reload(); // 새로고침으로 대응추후 DOM 조작으로 변경
                    })
                .catch((error) => {
                    console.error("댓글 수정 중 오류 발생:", error.message);
                });
        }
    });








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
