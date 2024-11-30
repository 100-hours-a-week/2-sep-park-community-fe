//회원정보 수정 API
//회원 탈퇴 API
//닉네임 중복 API
document.addEventListener('DOMContentLoaded', async () => {
    const emailElement = document.getElementById('emailInfo'); // email 정보를 표시할 요소
    const nameInput= document.getElementById('nameEdit');
    const circle= document.getElementById('circle');
    const editBtn = document.getElementById('editBtn');
    const editCheckBtn = document.getElementById('toastBtn');
    const nameEditHelper=document.getElementById('nameEditHelper');
    const infoProfile = document.getElementById('infoProfile');
    const modalOpenButton = document.querySelector('.modalOpenButton'); // class 선택
    const modalCloseButton = document.querySelector('.modalCloseButton'); // class 선택
    const modal = document.querySelector('.modalContainer'); // class 선택
    const profile = document.getElementById('profile');
    const infoDeleteCheck=document.getElementById('infoDeleteCheck');
    let userId = null;
    let selectedFile = null; // 선택된 파일을 기억하기 위한 변수

// 모달 열기 이벤트
    modalOpenButton.addEventListener('click', () => {
        modal.classList.remove('hidden'); // 'hidden' 클래스 제거
    });

// 모달 닫기 이벤트
    modalCloseButton.addEventListener('click', () => {
        modal.classList.add('hidden'); // 'hidden' 클래스 추가
    });
    try {
        // localStorage에서 프로필 이미지 경로 가져오기
        const profileImgPath = localStorage.getItem('profileImg');

        // 세션 데이터를 가져오기
        const response = await fetch("http://localhost:4000/auth/session", {
            method: 'GET',
            credentials: 'include', // 쿠키 포함
        });

        if (response.ok) {
            const data = await response.json();
            const userEmail = data.user.email;
            userId = data.user.userId; // 세션에서 userId 가져오기
            // 이메일을 HTML 요소에 동적으로 삽입
            if (emailElement) {
                emailElement.innerText = userEmail;
            }
            // 기본 프로필 이미지 설정
            if (profileImgPath) {
                circle.style.backgroundImage = `url(${profileImgPath})`;
                circle.style.backgroundSize = 'cover';
                circle.style.backgroundPosition = 'center';
            }
        } else {
            console.error("Failed to fetch session data");
        }
    } catch (error) {
        console.error('오류 발생:', error);
    }

    //circle을 클릭하면 파일 선택 창 열기
    circle.addEventListener('click', (e) =>{
        infoProfile.value = ''; // 입력값 초기화
        openDialog = true; // 파일 선택 창 열림 상태 저장
        infoProfile.click(); // 파일 선택 창 열기
    });

    // 파일 선택 후 미리보기
    infoProfile.addEventListener('change', (e) => {
        selectedFile = e.target.files[0]; // 선택된 파일 저장
        if (selectedFile) {
            const reader = new FileReader();
            reader.onload = (event) => {
                circle.style.backgroundImage = `url('${event.target.result}')`; // 미리보기 이미지 표시
                circle.style.backgroundColor = 'transparent'; // 기본 배경 제거
            };
            reader.readAsDataURL(selectedFile);
        }
    });

    //2. 수정 하기 버튼 클릭시 toast로 수정완료버튼 hide풀기
    //3. 수정 완료 버튼 클릭 시 요청
    // 닉네임 수정 버튼 클릭 이벤트
    editBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        const editName = nameInput.value.trim();
        //사용자 체크
        if (!userId) {
            alert("사용자 정보가 없습니다. 다시 로그인해주세요.");
            return;
        }
        // 닉네임 유효성 검사
        if (editName === "") {
            nameEditHelper.style.visibility = "visible";
            nameEditHelper.innerText ="닉네임을 입력해주세요.";
            return false;
        }
        else if (!editName || editName.length < 2) {
            nameEditHelper.style.visibility = "visible";
            nameEditHelper.innerText = "닉네임은 공백 없이 10글자 이내로 입력해야 합니다.";
            return false;
        }
        else if(editName.length>10){
            nameEditHelper.style.visibility = "visible";
            nameEditHelper.innerText = "닉네임은 최대 10자 까지 작성가능합니다.";
            return false;
        }
        try {
            // 닉네임 중복 확인 요청
            const response = await fetch(
                `http://localhost:4000/users/name/check?name=${encodeURIComponent(editName)}`, {
                method: 'GET',
                headers: { 'Content-Type': 'application/json'},
            });
            if (response.ok) {
                const result = await response.json();

                // 닉네임 중복 확인 완료
                nameEditHelper.style.visibility = "hidden";
                editCheckBtn.style.visibility = 'visible';
                alert("닉네임을 사용할 수 있습니다.");
            }
            else if(response.status === 409) {
                nameEditHelper.style.visibility = "visible";
                nameEditHelper.innerText = "이미 사용 중인 닉네임입니다.";
                return false;
            }
        } catch (error) {
            console.error("닉네임 확인 중 오류 발생:", error);
            alert("닉네임 중복 확인 중 문제가 발생했습니다. 다시 시도해주세요.");
        }
    });

    // 수정 완료 버튼 클릭 이벤트
    editCheckBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            //  닉네임 값 가져오기
            const editName = nameInput.value.trim();
            console.log(editName);
            console.log(userId);

            // FormData 생성
            const formData = new FormData();
            formData.append('name', editName); // 닉네임 추가
            if (selectedFile) {
                formData.append('profileImage', selectedFile); // 선택된 프로필 이미지 추가
            }
            const response = await fetch(`http://localhost:4000/users/${userId}`, {
                method: 'PUT',
                credentials: 'include',
                body: formData, // FormData 전송
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('profileImg', data.user.profileImagePath); // 로컬스토리지 업데이트
                alert("닉네임 및 프로필 이미지가 성공적으로 변경되었습니다.");
                window.location.href = "/posts";
                console.log("수정된 정보:", data);
            }
            else if (!response.ok) {
                console.error('서버 응답 상태 코드:', response.status);
                const errorText = await response.text(); // 응답 본문을 텍스트로 확인
                console.error('서버 응답 내용:', errorText); // HTML 에러 페이지 내용 확인
                throw new Error('수정 실패');
            }else {
                const errorData = await response.json();
                throw new Error(errorData.message || '수정 실패');
            }
        } catch (error) {
            console.error(' 수정 중 오류 발생:', error.message);
            alert("수정 중 문제가 발생했습니다.");
        }
    });
    //회원정보 삭제
    infoDeleteCheck.addEventListener('click', async (e) => {
        e.preventDefault();
        try{
            const response = await fetch(`http://localhost:4000/users/${userId}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            if (response.ok) {

                alert("회원정보 삭제되었습니다.");
                window.location.href = "/";
            } else {
                throw new Error('삭제 실패');
            }
             } catch (error) {
            console.error(':', error.message);
            alert(" 삭제 중 문제가 발생했습니다.");
            }


    })





});