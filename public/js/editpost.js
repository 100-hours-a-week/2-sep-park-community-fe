//import { API_URL } from '../../app.js';
import API_URL from './config.js';
document.addEventListener('DOMContentLoaded', async () => {
    const editForm = document.getElementById('editPost');
    const inputTitle = document.getElementById('editTitle');
    const inputContent = document.getElementById('editContent');
    const postImg = document.getElementById('editUpload');
    const currentImageInfo = document.getElementById('currentImageInfo');
    let imageStatus = "keep"; // 초기 상태: 기존 이미지 유지
    let initialImageUrl = ""; // 기존 이미지 파일명 저장
    const postId = window.location.pathname.split('/').pop();
    if (!editForm) {
        console.error("editPost 폼을 찾을 수 없습니다.");
        return;
    }
    try {
        // 서버에서 게시글 데이터 가져오기
        const response = await fetch(`${API_URL}/posts/${postId}/postImg`);
        if (response.ok) {
            const data = await response.json();
            const { postImagePath, title, body } = data;

            // 제목과 본문 필드에 기존 데이터 설정
            if (title) {
                inputTitle.value = title; // 제목 설정
            }
            if (body) {
                inputContent.value = body; // 본문 설정
            }

            // 기존 이미지 파일명 설정
            if (postImagePath) {
                initialImageUrl = postImagePath.split('/').pop();
                currentImageInfo.textContent = `현재 이미지: ${initialImageUrl}`;
            } else {
                currentImageInfo.textContent = "현재 이미지: 없음";
            }
        }
    } catch (error) {
        console.error("이미지 데이터 로드 중 오류 발생:", error);
    }



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
                //headers: { "Content-Type": file.type },
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


    let isFileDialogOpen = false; // 파일 선택창이 열렸는지 추적

// 파일 선택 버튼 클릭 시 파일 선택창 열림 감지
    postImg.addEventListener('click', () => {
        isFileDialogOpen = true; // 파일 선택창 열림 상태로 설정
    });

// 파일 선택창에서 변경 이벤트 감지
    postImg.addEventListener('change', () => {
        if (postImg.files.length > 0) {
            // 새 파일이 선택된 경우
            currentImageInfo.textContent = `선택된 파일: ${postImg.files[0].name}`;
            imageStatus = "new"; // 새 이미지 업로드 상태
            isFileDialogOpen = false; // 파일 선택창 닫힘
        } else if (isFileDialogOpen) {
            // 파일 선택창이 열려 있었지만 취소된 경우
            currentImageInfo.textContent = "현재 이미지: 없음";
            imageStatus = "null"; // 이미지 없음 상태로 설정
            isFileDialogOpen = false; // 파일 선택창 닫힘
        }
    });

    // 게시글 수정 요청
    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        let imageUrl = initialImageUrl; // 기본적으로 기존 이미지 유지
        if (imageStatus === "new" && postImg.files[0]) {
            const file = postImg.files[0];

            // Presigned URL 요청
            const presignedData = await getPresignedUrl(file);
            if (!presignedData) return;

            // S3로 이미지 업로드
            const uploadSuccess = await uploadImageToS3(presignedData.uploadUrl, file);
            if (!uploadSuccess) return;

            imageUrl = presignedData.fileUrl; // 새 이미지 URL 업데이트
        } else if (imageStatus === "null") {
            imageUrl = null; // 이미지 삭제
        }

        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    editTitle: inputTitle.value,
                    editContent: inputContent.value,
                    postImg: imageUrl, // S3 URL 사용
                    imageStatus: imageStatus,
                }),
            });

            if (response.status === 403) {
                alert("게시글 수정 권한이 없습니다.");
                window.location.href = '/posts';
            } else if (response.status === 401) {
                alert("로그인 정보가 없습니다.");
                window.location.href = '/';
            } else if (response.ok) {
                alert('게시물이 성공적으로 수정되었습니다!');
                window.location.href = '/posts';
            }
        } catch (error) {
            console.error('게시물 수정 중 오류 발생:', error);
            alert('문제가 발생했습니다. 다시 시도해주세요.');
        }
    });
});
