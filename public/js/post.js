// 게시글 목록 API
//import { API_URL } from '../../app.js';
document.addEventListener('DOMContentLoaded', () => {
const container = document.querySelector('.posts');
    // 로그인 버튼 클릭 시 동작
    const postBtn = document.getElementById('postRegisterButton');
    postBtn.addEventListener('click', () => {
        window.location.href = '/posts/addpost'; // 버큰 클릭 후 게시물 작성 페이지 이동
    });

    // 게시물박스 클릭 시 동작
    //const postBox = document.getElementById('postBox');
    //postBox.addEventListener('click', () => {
        //window.location.href = '/postcheck'; // 해당 게시물로 이동
   // });
// 게시물 목록 가져오기


    fetch(`${API_URL}/posts`, {
        method: 'GET',
        mode: 'cors',
        credentials: "include", // 쿠키를 요청에 포함
    })
        .then((response) => {

            if (!response.ok) {
                if(response.status === 401) {
                    alert('로그인이 필요합니다.');
                    window.location.href = '/';
                }
                throw new Error('게시물 목록을 불러오지 못했습니다.');
            }
            return response.json();
        })
        .then((data) => {
            console.log(data); // 반환된 데이터 구조 확인
            const posts = data.data;
            const postsContainer = document.querySelector('.posts');
            postsContainer.innerHTML = ''; // 기존 게시물 초기화
            if (!posts || posts.length === 0) {
                postsContainer.innerHTML = "<p>게시글이 없습니다.</p>";
                return;
            }
            posts.forEach((post) => {
                const postHTML = `
                <a href="/posts/${post.postId}">
                    <div class="box">
                        <div class="titletext">
                            <div id="titleText">${post.title}</div>
                            <div class="info">
                                <div>좋아요 ${post.likeCount} 댓글 ${post.commentCount} 조회수 ${post.viewCount}</div>
                                <div>${post.dateAt}</div>
                            </div>
                            <div class="author">
                                <img src="${post.profileImage}" alt="${post.author}의 프로필 이미지">
                                ${post.author}
                            </div>
                        </div>
                    </div>
                </a>
            `;
                postsContainer.innerHTML += postHTML;
            });
        })
        .catch((err) => console.error(err.message));

});
