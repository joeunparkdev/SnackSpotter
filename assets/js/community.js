function createReview() {
  console.log('createReview function called');
  const isLoggedIn = checkLoginStatus();

  if (!isLoggedIn) {
    // 로그인되어 있지 않으면 메시지 표시 후 함수 종료
    alert('로그인을 해주세요.');
    return;
  }

  // 로그인이 되어 있으면 포스트 작성 페이지로 이동
  window.location.href = './storeReviews.html';
}

// 쿠키 가져오기
function getCookie(name) {
  const cookies = document.cookie.split(';');
  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim();

    if (cookie.startsWith(name + '=')) {
      return cookie.substring(name.length + 1);
    }
  }
  return null;
}

function checkLoginStatus() {
  // 클라이언트에서 쿠키에서 토큰 읽기
  const cookieString = document.cookie;
  
  // 토큰이 있다면 사용
  if (cookieString) {
    const token = cookieString
      .split('; ')
      .find(row => row.startsWith('token='))
      .split('=')[1];

    return !!token;
  } else {
    console.log('No cookies found');
    return false;
  }
}
async function fetchReviews() {
  try {
    const response = await fetch('http://localhost:3000/api/store-reviews');
    if (!response.ok) {
      throw new Error('서버 응답이 실패하였습니다.');
    }

    const data = await response.json();
    console.log('Response Data:', data);
    return data.reviews;
  } catch (error) {
    console.error('에러 ---', error);
    throw error;
  }
}
// 편의점 리뷰 렌더링하기
async function renderReviewCards() {
  try {
    const reviews = await fetchReviews();
    const reviewCardsContainer = document.getElementById('productCardsContainer');

    for (let i = 0; i < reviews.length; i++) {
      const review = reviews[i];
      const imageUrl = review.image ? `http://localhost:3000${review.image}` : '';
      const storeName = review.store ? review.store.name : 'No Store Name';
      const userName = review.user ? review.user.name : 'No User Name';

      function getStarRating(rating) {
        const stars = '⭐'.repeat(rating); 
        return stars || 'No Rating'; 
      }

      reviewCardsContainer.innerHTML += `
        <div class="col">
          <div class="card h-100">
            ${review.image ? `<img src="${imageUrl}" class="card-img-top" alt="${storeName}">` : ''}
            <div class="card-body">
            <h5 class="card-title" style="color: #0D6EFD;">${storeName}</h5>
              <p class="card-text">별점: ${getStarRating(review.rating)}</p>
              <p class="card-text">${review.comment}</p>
              <p class="card-text">글쓴이: ${userName}</p>
              <button class="btn btn-outline-primary" onclick="deleteReview(${review.id})">Delete Review</button>
              <button class="btn btn-primary" onclick="editReview(${review.id})">Edit Review</button>
            </div>
          </div>
        </div>`;
    }
  } catch (error) {
    console.error('에러 ---', error);
  }
}

// 리뷰 삭제
async function deleteReview(reviewId) {
  try {
    const response = await fetch(`http://localhost:3000/api/store-reviews/${reviewId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${getCookie('token')}`,
      },
    });

    if (response.ok) {
      const result = await response.json();
      // 삭제 후 페이지 갱신
      location.reload();
    } 
    else if (response.status === 403) {
      // 권한이 없는 경우 알림 표시
      alert('수정할 권한이 없습니다.');
    }
    else {
      console.error('Error deleting review:', response.status, response.statusText);
    }
  } catch (error) {
    console.error('Error deleting review:', error);
  }
}

// 리뷰 수정 페이지로 이동
async function editReview(reviewId) {
  // 토큰 가져오기
  const token = getCookie('token');

  if (token) {
    try {
      const response = await fetch(`http://localhost:3000/api/store-reviews/${reviewId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        // 리뷰를 작성한 사용자와 현재 로그인한 사용자가 동일하면 수정 페이지로 이동
        window.location.href = `./storeReviews.html?id=${reviewId}`;
      } else if (response.status === 403) {
        // 권한이 없는 경우 알림 표시
        alert('수정할 권한이 없습니다.');
      } else {
        console.error('Error fetching review:', response.status, response.statusText);
      }
    } catch (error) {
      console.error('Error fetching review:', error);
    }
  } else {
    // 토큰이 없는 경우 로그인 페이지로 이동 또는 다른 처리를 수행
    alert('로그인이 필요합니다.');
  }
}



// 페이지 로드 시 자동으로 리뷰 카드 렌더링 함수 호출
window.onload = renderReviewCards;
