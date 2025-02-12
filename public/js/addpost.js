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

// Presigned URL 요청 함수
    async function getPresignedUrl(file) {
        try {
            const response = await fetch(`${API_URL}/upload/presigned-url?fileName=${encodeURIComponent(file.name)}&fileType=${encodeURIComponent(file.type)}&folder=posts`);
            if (!response.ok) throw new Error("Presigned URL 요청 실패");

            const { uploadUrl, fileUrl } = await response.json();
            return { uploadUrl, fileUrl };
        } catch (error) {
            console.error("Presigned URL 요청 중 오류:", error);
            alert("이미지 업로드 URL을 가져오는 중 문제가 발생했습니다.");
            return null;
        }
    }

    // S3로 직접 이미지 업로드
    async function uploadImageToS3(uploadUrl, file) {
        try {
            const response = await fetch(uploadUrl, {
                method: "PUT",
                headers: { "Content-Type": file.type },
                body: file,
            });
            if (!response.ok) throw new Error("S3 업로드 실패");
            return true;
        } catch (error) {
            console.error("S3 업로드 중 오류:", error);
            alert("이미지 업로드 중 문제가 발생했습니다.");
            return false;
        }
    }


// 게시글 작성
    if (postBtn) {
        postBtn.addEventListener('click', async (e) => {
            e.preventDefault();

            if (!validatePostData()) return;

            let imageUrl = null;

            if (postImg?.files && postImg.files[0]) {
                const file = postImg.files[0];

                // Presigned URL 요청
                const presignedData = await getPresignedUrl(file);
                if (!presignedData) return;

                // S3로 이미지 업로드
                const uploadSuccess = await uploadImageToS3(presignedData.uploadUrl, file);
                if (!uploadSuccess) return;

                imageUrl = presignedData.fileUrl; // CloudFront URL 사용
            }

            // 게시글 API 요청
            try {
                const response = await fetch(`${API_URL}/posts`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    credentials: "include", // 쿠키를 요청에 포함
                    body: JSON.stringify({
                        title: title.value,
                        content: content.value,
                        postImg: imageUrl, // S3 URL을 백엔드로 전송
                    }),
                });

                if (response.ok) {
                    alert("게시물 작성 성공");
                    window.location.href = "/posts";
                } else if (response.status === 401) {
                    alert("로그인이 필요합니다.");
                    window.location.href = "/";
                }
            } catch (error) {
                console.error("게시글 추가 중 오류:", error);
                alert("게시글 작성 중 문제가 발생했습니다. 다시 시도해주세요.");
            }
        });
    }
});