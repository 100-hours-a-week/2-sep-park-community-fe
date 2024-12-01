// 상세 게시글 조회 API
//댓글 작성,수정,삭제 API
//게시글 수정, 삭제 API
document.addEventListener('DOMContentLoaded', () => {
    const postComments = document.getElementById('postComments');
    const commentText = document.getElementById('commentText'); // 댓글 input


    // 현재 URL 경로에서 postId 추출
    const pathname = window.location.pathname; // 예: "/posts/1"
    const match = pathname.match(/\/posts\/(\d+)/); // 정규식으로 postId 추출

// postId 추출 여부 확인
    const postId = match ? match[1] : null;

    // 게시글 조회 (랜더링)
    fetch(`http://localhost:4000/posts/${postId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: "include",
    })
        .then(handleResponse)
        .then((data) => {
            const post = data.data.post;
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
                                <div class="minibtn modify-btn" id="postModifyBtn">수정</div>
                                <div class="minibtn delete-btn" id="postDeleteBtn">삭제</div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="imgContainer"><img  id="postImg" src="${post.postImagePath}"></div>
                <div class="textContainer">${post.content}</div>
            </div>
            <div class="clickBtn">
                        <div class="views" id="likeBtn">
                            <div class="count" id="likeContainer">${post.likeCount}</div>
                            좋아요
                        </div>
                        <div class="views">
                            <div class="count">${post.commentCount}</div>
                            댓글
                        </div>
                        <div class="views">
                            <div class="count">${post.viewCount}</div>
                            조회수
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
                // 클릭된 요소의 ID가 'likeContainer'인지 확인
                if (e.target.id === 'likeContainer') {
                    e.preventDefault();
                    console.log('좋아요 클릭!2');
                    try {
                        // 좋아요 상태 조회
                        const response = await fetch(`http://localhost:4000/posts/${postId}/like/likeCheck`, {
                            method: 'GET',
                            mode: 'cors',
                            credentials: 'include',
                        });
                        // { isLiked: true}
                        if (response.ok) {
                            const { isLiked } = await response.json(); // 응답에서 isLiked 추출

                            if (isLiked) {
                                // 좋아요 취소
                                const deleteResponse = await fetch(`http://localhost:4000/posts/${postId}/like`, {
                                    method: 'DELETE',
                                    mode: 'cors',
                                    credentials: 'include',
                                });

                                if (deleteResponse.ok) {
                                    console.log('좋아요 취소 완료');
                                    window.location.reload(); // 새로고침
                                } else {
                                    console.error('좋아요 취소 중 오류 발생');
                                }
                            } else {
                                // 좋아요 추가
                                const postResponse = await fetch(`http://localhost:4000/posts/${postId}/like`, {
                                    method: 'get',
                                    mode: 'cors',
                                    credentials: 'include',
                                });

                                if (postResponse.ok) {
                                    console.log('좋아요 추가 완료');
                                    window.location.reload(); // 새로고침
                                } else {
                                    console.error('좋아요 추가 중 오류 발생');
                                }
                            }
                        }
                    } catch (error) {
                        console.error('네트워크 오류 발생:', error);
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
                                fetch(`http://localhost:4000/posts/${postId}`, {
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
    fetch(`http://localhost:4000/posts/${postId}/comments`, {
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
                    <div class="minibtns">. 
                        <div class="minibtn modify-btn" data-id="${comment.commentId}" id="commentModifyBtn">수정</div>
                        <div class="minibtn delete-btn" data-id="${comment.commentId}" id="commentDeleteBtn">삭제</div>
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
        if (e.target.classList.contains('delete-btn') && e.target.getAttribute('data-id')) {
            const commentId = e.target.getAttribute('data-id');
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
                        fetch(`http://localhost:4000/posts/${postId}/comments/${commentId}`, {
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
    document.body.addEventListener('click', (e) => {
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
    postComments.addEventListener('click', (e) => {
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
            fetch(`http://localhost:4000/posts/${postId}/comments/${editingCommentId}`, {
                method: 'PUT',
                mode: 'cors',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: commentContent }),
            })
                .then((response) => {
                    if (!response.ok) {
                        if (response.status === 403) {
                            throw new Error('댓글 수정 권한이 없습니다.');
                        }
                        throw new Error('댓글 수정에 실패했습니다.');
                    }
                    return response.json();
                })
                .then((data) => {
                    alert("댓글 수정 성공!");
                    console.log("수정된 댓글:", data);
                    location.reload(); // 페이지 새로고침
                })
                .catch((error) => {
                    console.error("댓글 수정 중 오류 발생:", error.message);
                    alert("댓글 수정 중 문제가 발생했습니다.");
                });
        } else {
            // 댓글 작성 상태일 때 POST 요청
            fetch(`http://localhost:4000/posts/${postId}/comments`, {
                method: 'POST',
                mode: 'cors',
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ text: commentContent }),
            })


                .then((data) => {
                    alert("댓글 작성 성공!");
                    console.log("작성된 댓글:", data);

                    // DOM 업데이트
                    const commentElement = document.querySelector(`[data-id="${editingCommentId}"]`);
                    if (!commentElement) {
                        console.error(`댓글 요소를 찾을 수 없습니다. ID: ${editingCommentId}`);
                        location.reload(); // 새로고침으로 대응
                        return;
                    }

                    const contentElement = commentElement.querySelector('.comment-content');
                    if (!contentElement) {
                        console.error(`댓글 내용 요소를 찾을 수 없습니다. ID: ${editingCommentId}`);
                        location.reload(); // 새로고침으로 대응
                        return;
                    }

                    contentElement.textContent = commentContent;

                    // 수정 상태 초기화
                    isEditing = false;
                    editingCommentId = null;
                    commentText.value = ""; // 입력 필드 초기화
                    postComments.textContent = "댓글 등록"; // 버튼 텍스트 복원
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
            throw new Error("401 Unauthorized");
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
