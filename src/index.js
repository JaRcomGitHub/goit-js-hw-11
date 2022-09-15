import axios from "axios";
import './css/styles.css';
import Notiflix from 'notiflix';

const API_KEY = "29840548-44be53550e175681813a70adf";
const PER_PAGE = 40;
const PHOTO_LIMIT = 500;

const formEl = document.querySelector('form#search-form');
const galleryEl = document.querySelector('div.gallery');
const btnLoadMoreEl = document.querySelector('button.load-more');

formEl.addEventListener('submit', onFormSubmit);
btnLoadMoreEl.addEventListener('click', onClickLoadMore);

btnLoadMoreEl.style.display = 'none';
let pageCnt;
let requestTerm;

function getPixabayURL(searchTerm, pageNum) {
  const basePixabayURL = "https://pixabay.com/api/";
  const searchParams = new URLSearchParams({
    key: API_KEY,
    q: searchTerm,
    image_type: "photo",
    orientation: "horizontal",
    safesearch: true,
    per_page: PER_PAGE,
    page: pageNum,
  });
  // console.log("pageNum = "+pageNum);
  return `${basePixabayURL}?${searchParams}`;
}

function fetchPixabayPhoto(url) {
  //return promise
  return fetch(url)
    .then((response) => {
      if (!response.ok) {
        throw new Error(response.status);//for fetch() and 404
      }
      return response.json();
    });
}

function onFormSubmit(evt) {
  evt.preventDefault();

  const requestValue = formEl.searchQuery.value.trim();

  if (requestValue === "") {
    return;
  }

  pageCnt = 1;
  requestTerm = requestValue;
  btnLoadMoreEl.style.display = 'none';
  galleryEl.textContent = "";

  const url = getPixabayURL(requestTerm, pageCnt);

  superfun(url);
}

function superfun(url) {
  fetchPixabayPhoto(url)
    .then(data => {
      // console.log(data);
      // console.log(data.total);
      // console.log(data.totalHits);
      
      const totalHits = data.totalHits;

      if (totalHits === 0) {
        Notiflix.Notify.failure("Sorry, there are no images matching your search query. Please try again.");
        return;
      }
      if (pageCnt === 1) {
        Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`); 
        if (totalHits > PER_PAGE) {
          btnLoadMoreEl.style.display = 'block';
        }
      }

      //каждая открывается модалкой и есть стрелочки просмотра в модалке

      const markup = data.hits.map(data => markupPhotoCard(data)).join('');
      galleryEl.insertAdjacentHTML("beforeend", markup);

      if ((pageCnt > 1)&&(data.hits.length < PER_PAGE)) {
        Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
        btnLoadMoreEl.style.display = 'none';
      }
  })
  .catch(error => {
    console.log(error);
    // if (error.message == 404) {
    // }
    if (error.message == 400) {
      if (pageCnt > (PHOTO_LIMIT/PER_PAGE)) {
        Notiflix.Notify.info("The API is limited to return a maximum of 500 images per query.");
        btnLoadMoreEl.style.display = 'none';
      }
    }
  });
}

function onClickLoadMore() {
  pageCnt += 1;
  const url = getPixabayURL(requestTerm, pageCnt);
  superfun(url);
}

function markupPhotoCard(
  { largeImageURL, webformatURL, tags, likes, views, comments, downloads }
) {
  return `
  <a class="photo-link" href="${largeImageURL}">
    <div class="photo-card">
      <img src="${webformatURL}" alt="${tags}" loading="lazy" />
      <div class="info">
        <p class="info-item">
          <b>Likes</b>
          ${likes}
        </p>
        <p class="info-item">
          <b>Views</b>
          ${views}
        </p>
        <p class="info-item">
          <b>Comments</b>
          ${comments}
        </p>
        <p class="info-item">
          <b>Downloads</b>
          ${downloads}
        </p>
      </div>
    </div>
  </a>
  `;
}

// axios.get('/users')
//   .then(res => {
//     console.log(res.data);
//   });


// В ответе будет массив изображений удовлетворивших критериям параметров запроса.
// Каждое изображение описывается объектом, из которого тебе интересны только следующие свойства:

// Если бэкенд возвращает пустой массив, значит ничего подходящего найдено небыло.
// В таком случае показывай уведомление с текстом
// "Sorry, there are no images matching your search query. Please try again.". 
// Для уведомлений используй библиотеку notiflix.


//https://pixabay.com/api/?key=29840548-44be53550e175681813a70adf& q=yellow & image_type=photo & orientation=horizontal & safesearch=true&page=1
//

