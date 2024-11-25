document.addEventListener('DOMContentLoaded', () => {
    const modal = document.getElementById('globalModal'); // 공용 모달 창
    const modalTitle = document.getElementById('modalTitle');
    const modalMessage = document.getElementById('modalMessage');
    const postComments = document.getElementById('postComments');
    const closeButton = document.querySelector('.modalCloseButton');
    const confirmButton = document.querySelector('.modalCheckButton');
    const commentText = document.getElementById('commentText');
    let currentTarget = null; // 현재 작업 중인 대상
    const pathname = window.location.pathname; // 예: "/post/1"
    const postId = pathname.split('/').pop(); // URL의 마지막 부분 가져오기
    // 삭제 버튼 이벤트 추가 함수
    function attachDeleteEvent() {
        const deleteButtons = document.querySelectorAll('.delete-btn');
        const modifyButton = document.querySelector('.modify-btn');

        // 게시글 수정 버튼 클릭 시 수정 페이지로 이동
        modifyButton.addEventListener('click', (e) => {

            const pathname = window.location.pathname; // 현재 URL 경로
            const postId = pathname.split('/').pop(); // 현재 postId 추출
            window.location = `/editpost/${postId}`; // 실제 postId로 URL 변경
        });
        deleteButtons.forEach((button) => {
            button.addEventListener('click', () => {
                const targetType = button.getAttribute('data-target'); // 게시글인지 댓글인지 확인
                currentTarget = targetType;

                // 모달 내용 동적 변경
                if (targetType === 'post') {
                    modalTitle.textContent = '게시글을 삭제하시겠습니까?';
                    modalMessage.textContent = '삭제한 내용은 복구할 수 없습니다.';
                } else if (targetType === 'comment') {
                    modalTitle.textContent = '댓글을 삭제하시겠습니까?';
                    modalMessage.textContent = '삭제한 내용은 복구할 수 없습니다.';
                }

                modal.classList.remove('hidden'); // 모달 열기
            });
        });
    }

    // 모달 닫기 버튼
    closeButton.addEventListener('click', () => {
        modal.classList.add('hidden'); // 모달 닫기
    });

    // 모달 확인 버튼
    confirmButton.addEventListener('click', () => {
                if (currentTarget === 'post') {
                    console.log('게시글 삭제 작업 실행');
                    fetch(`http://localhost:4000/posts/${postId}`, {
                        method: 'DELETE',
                        credentials: 'include',
                    })
                        .then((response) => {
                            if (response.status === 401) {
                                alert("사용자 인증이 필요합니다. 다시 로그인해주세요.");
                                throw new Error("401 Unauthorized");
                            }
                            if (response.status === 403) {
                                alert("게시글 삭제 권한이 없습니다.");
                                throw new Error("403 Forbidden");
                            }
                            if (response.status === 404) {
                                alert("해당 게시글을 찾을 수 없습니다.");
                                throw new Error("404 Not Found");
                            }
                            if (!response.ok) {
                                alert("게시글 삭제에 실패했습니다. 다시 시도해주세요.");
                                throw new Error("삭제 실패");
                            }
                            return response.json();
                        })
                        .then((data) => {
                            console.log("삭제 성공", data);
                            alert("게시글이 성공적으로 삭제되었습니다.");
                            window.location.href = "/posts"; // 삭제 후 페이지 이동
                        })
                        .catch((error) => {
                            console.error("에러 발생:", error.message);
                        });
        } else if (currentTarget === 'comment') {
            console.log('댓글 삭제 작업 실행');
        }

        modal.classList.add('hidden'); // 모달 닫기
    });
    // 상세 게시글 렌더링
    fetch(`http://localhost:4000/posts/${postId}`, {
        method: 'GET',
        mode: 'cors',
        credentials: "include", // 쿠키를 요청에 포함
    })
        .then((response) => {
            if (!response.ok) {
                throw new Error('게시물 상세 정보를 불러오지 못했습니다.');
            }
            return response.json();
        })
        .then((data) => {
            const post = data.data.post; // 상세 게시글 데이터
            const postContainer = document.querySelector('.post');
            postContainer.innerHTML = `
                <div class="post">
                    <div class="box">
                        <div class="titletext">
                            ${post.title}
                            <div class="info">
                                <div class="author">
                                    <img src="${post.profile_image}" alt="작성자 이미지">
                                    ${post.author}
                                </div>
                                <div class="date">${post.date_at}</div>
                                <div class="minibtns">
                                    <div class="minibtn modify-btn">수정</div>
                                    <div class="minibtn delete-btn" data-target="post">삭제</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="imgContainer" >
                        <img src="${post.postImagePath}">
                    </div>
                    <div class="textContainer">${post.content}</div>
                    <div class="clickBtn">
                        <div class="views">
                            <div class="count">${post.like_count}</div>
                            좋아요
                        </div>
                        <div class="views">
                            <div class="count">${post.comment_count}</div>
                            댓글
                        </div>
                        <div class="views">
                            <div class="count">${post.view_count}</div>
                            조회수
                        </div>
                    </div>
                    <div class="makeComment">
                        <div class="box">
                            <textarea id="commentText" placeholder="댓글을 남겨주세요!"></textarea>
                        </div>
                        <div class="btn">
                            <button id="postComment">댓글 등록</button>
                        </div>
                    </div>
                </div>
            `;

            // 새로 렌더링된 삭제 버튼에 이벤트 연결
            attachDeleteEvent();
        })
        .catch((err) => console.error(err.message));
}




);
