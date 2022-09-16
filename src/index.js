import axios from "axios";
import './css/styles.css';
import Notiflix from 'notiflix';
import SimpleLightbox from "simplelightbox";
import "simplelightbox/dist/simple-lightbox.min.css";

const API_KEY = "29840548-44be53550e175681813a70adf";
const PER_PAGE = 40;
const PHOTO_LIMIT = 500;

let glPageCnt;
let glRequestTerm;
let glSimpleLightbox;

const formEl = document.querySelector('form#search-form');
const galleryEl = document.querySelector('div.gallery');
const btnLoadMoreEl = document.querySelector('button.load-more');

formEl.addEventListener('submit', onFormSubmit);
galleryEl.addEventListener('click', onImageGalleryClick);
btnLoadMoreEl.addEventListener('click', onClickLoadMore);

btnLoadMoreEl.style.display = 'none';

function onImageGalleryClick(event){
    event.preventDefault();
}

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
  return `${basePixabayURL}?${searchParams}`;
}

async function axiosGetPixabayPhoto(url) {
  try {
    const response = await axios.get(url);
    // console.log(response);
    return response;
  } catch (error) {
    console.error(error);
  }
}

const getGalleryPhotoByNumPage = (requestTerm, numPage, onSuccess, onError) => {
  const url = getPixabayURL(requestTerm, numPage);
  axiosGetPixabayPhoto(url)
    .then(data => {
      onSuccess(data);
  })
    .catch(error => {
      console.log(error);
      onError(error);
  });
}

function onFormSubmit(evt) {
  evt.preventDefault();

  const requestValue = formEl.searchQuery.value.trim();
  if (requestValue === "") {
    return;
  }

  glPageCnt = 1;
  glRequestTerm = requestValue;
  btnLoadMoreEl.style.display = 'none';
  galleryEl.textContent = "";

  getGalleryPhotoByNumPage(glRequestTerm, glPageCnt, responseGalleryPhoto, gotAnError);
}

function responseGalleryPhoto(data) {
  // const total = data.data.total;
  const totalHits = data.data.totalHits;
  const hits = data.data.hits;

  // console.log(total);
  // console.log(totalHits);
  // console.log(hits);

  if (totalHits === 0) {
    Notiflix.Notify.failure(
      "Sorry, there are no images matching your search query. \
      Please try again.");
    return;
  }
  
  renderGalleryPhoto(hits);
  
  if (glPageCnt === 1) {
    glSimpleLightbox = new SimpleLightbox('.gallery a');
    Notiflix.Notify.success(`Hooray! We found ${totalHits} images.`); 
    if (totalHits > PER_PAGE) {
      btnLoadMoreEl.style.display = 'block';
    }
  } else {
    glSimpleLightbox.refresh();
  }

  if ((glPageCnt > 1)&&(hits.length < PER_PAGE)) {
    Notiflix.Notify.info("We're sorry, but you've reached the end of search results.");
    btnLoadMoreEl.style.display = 'none';
  }
}

function gotAnError(error) {
  //if (error.message == 404) { }
  if (error.message == 400) {
    if (glPageCnt > (PHOTO_LIMIT/PER_PAGE)) {
      Notiflix.Notify.info("The API is limited to return a maximum of 500 images per query.");
      btnLoadMoreEl.style.display = 'none';
    }
  }
}

function onClickLoadMore() {
  glPageCnt += 1;
  getGalleryPhotoByNumPage(glRequestTerm, glPageCnt, responseGalleryPhoto, gotAnError);
}

function renderGalleryPhoto(arrayPhoto) {
  const markup = arrayPhoto.map(data => markupPhotoCard(data)).join('');

  galleryEl.insertAdjacentHTML("beforeend", markup);
}

function useForGallerySimpleLightbox(){
  new SimpleLightbox('.gallery a');
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
