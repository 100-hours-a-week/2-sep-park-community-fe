//import { API_URL } from '../../app.js';
document.addEventListener('DOMContentLoaded', async () => {
    const editForm = document.getElementById('editPost');
    const title = document.getElementById('editTitle');
    const content = document.getElementById('editContent');
    const postImg = document.getElementById('editUpload');
    const currentImageInfo = document.getElementById('currentImageInfo');
    let imageStatus = "keep"; // 초기 상태: 기존 이미지 유지
    let initialImageName = ""; // 기존 이미지 파일명 저장
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
            const { postImagePath } = data;

            // 기존 이미지 파일명 설정
            if (postImagePath) {
                initialImageName = postImagePath.split('/').pop();
                currentImageInfo.textContent = `현재 이미지: ${initialImageName}`;
            } else {
                currentImageInfo.textContent = "현재 이미지: 없음";
            }
        }
    } catch (error) {
        console.error("이미지 데이터 로드 중 오류 발생:", error);
    }
    // FormData 생성 및 데이터 확인
    function createFormData() {
        const formData = new FormData(editForm);

        // 디버깅용 콘솔 출력
        console.log("FormData 내용 확인:");
        for (let [key, value] of formData.entries()) {
            console.log(`${key}:`, value instanceof File ? value.name : value);
        }
        return formData;
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

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 각 필드의 값 확인
        console.log("제목:", title.value);
        console.log("내용:", content.value);
        console.log("파일:", postImg.files[0]);

        const formData = createFormData();
        formData.append("imageStatus", imageStatus);
        try {
            const response = await fetch(`${API_URL}/posts/${postId}`, {
                method: 'PUT',
                body: formData,
                credentials: "include", // 쿠키를 요청에 포함
            });
            if(response.status===403){
                alert("게시글 수정 권한이 없습니다.");
                window.location.href = '/posts';
            }
            else if(response.status===401){
                alert("로그인 정보가 없습니다.");
                window.location.href = '/';
            }
            else if (response.ok) {
                alert('게시물이 성공적으로 수정되었습니다!');
                window.location.href = '/posts';
            }
        } catch (error) {
            console.error('게시물 수정 중 오류 발생:', error);
            alert('문제가 발생했습니다. 다시 시도해주세요.');
        }
    });
});
