//import { API_URL } from '../../app.js';
import API_URL from './config.js';
document.addEventListener('DOMContentLoaded', () => {
    const arrow = document.getElementById('arrow');
    const title = document.getElementById('postTitle');
    const content = document.getElementById('postContent');
    const postImg = document.getElementById('postUpload');
    const postBtn = document.getElementById('postBtn');
    // 뒤로가기 버튼
    if (arrow) {
        arrow.addEventListener('click', () => {
            window.location.href = '/post';
        });
    }

    // 게시글 데이터 유효성 검사
    function validatePostData() {
        if (!title?.value.trim()) {
            alert("제목을 입력해주세요.");
            return false;
        }
        if (!content?.value.trim()) {
            alert("내용을 입력해주세요.");
            return false;
        }
        return true;
    }
    // 버튼 색상 업데이트 함수
    function updateButtonColor() {
        if (!title.value.trim() || !content.value.trim()) {
            postBtn.style.backgroundColor = "#ACA0EB"; // 비활성화 색상
            postBtn.disabled = true;
        } else {
            postBtn.style.backgroundColor = "#7F6AEE"; // 활성화 색상
            postBtn.disabled = false;
        }
    }

    // 제목, 본문 입력 이벤트 리스너
    title.addEventListener("input", updateButtonColor);
    content.addEventListener("input", updateButtonColor);

    // 버튼 상태 업데이트
    updateButtonColor();

    // 폼 데이터 생성
    function createFormData() {
        const formData = new FormData();
        formData.append("title", title.value);
        formData.append("content", content.value);

        if (postImg?.files && postImg.files[0]) {
            formData.append("postImg", postImg.files[0]);
        }
        console.log("FormData 생성 완료:", formData);
        return formData;
    }


    // 게시글 작성
    if (postBtn) {
        postBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!validatePostData()) return;

            const formData = createFormData();

            try {
                const response = await fetch(`${API_URL}/posts`, {
                    method: "POST",
                    body: formData,
                    credentials: "include", // 쿠키를 요청에 포함
                });
                if (response.ok) {
                    alert("게시물 작성 성공");
                    window.location.href = "/posts";
                }
                else if(response.status === 401) {
                    alert(arr.message);
                    window.location.href = "/";
                }
            } catch (error) {
                console.error("게시글 추가 중 오류:", error);
                alert("게시글 작성 중 문제가 발생했습니다. 다시 시도해주세요.");
            }
        });
    }

});
