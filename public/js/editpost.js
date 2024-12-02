document.addEventListener('DOMContentLoaded', () => {
    const editForm = document.getElementById('editPost');
    const title = document.getElementById('editTitle');
    const content = document.getElementById('editContent');
    const postImg = document.getElementById('editUpload');

    if (!editForm) {
        console.error("editPost 폼을 찾을 수 없습니다.");
        return;
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

    editForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // 각 필드의 값 확인
        console.log("제목:", title.value);
        console.log("내용:", content.value);
        console.log("파일:", postImg.files[0]);

        const formData = createFormData();

        try {
            const postId = window.location.pathname.split('/').pop();
            const response = await fetch(`http://localhost:4000/posts/${postId}`, {
                method: 'PUT',
                body: formData,
                credentials: "include", // 쿠키를 요청에 포함
            });
            if(response.status===403){
                alert("게시글 수정 권한이 없습니다.");
                window.location.href = '/posts';
                return;
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
