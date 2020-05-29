'use strict'

const IMG_URL = 'https://image.tmdb.org/t/p/w185_and_h278_bestv2';
const API_KEY = '40ffbdb69259144916d886e6dbe468fa';
const SERVER = 'https://api.themoviedb.org/3/'

const leftMenu = document.querySelector('.left-menu');
const hamburger = document.querySelector('.hamburger');
const tvShowsList = document.querySelector('.tv-shows__list');
const modal = document.querySelector('.modal');
const tvShows = document.querySelector('.tv-shows');
const dropdown = document.querySelectorAll('.dropdown');
const tvShowsHead = document.querySelector('.tv-shows__head');
const posterWrapper = document.querySelector('.poster__wrapper');
const modalContent = document.querySelector('.modal__content');
const pagination = document.querySelector('.pagination');


const searchForm = document.querySelector('.search__form');
const searchFormInput = document.querySelector('.search__form-input');


//Переменные для модального окна
const tvCardImg = document.querySelector('.tv-card__img');
const modalTitle = document.querySelector('.modal__title');
const genresList = document.querySelector('.genres-list');
const rating = document.querySelector('.rating');
const description = document.querySelector('.description');
const modalLink = document.querySelector('.modal__link');


const preloader = document.querySelector('.preloader')
const loading = document.createElement('div');
loading.className = 'loading';


const DBService = class {
   getData = async (url) => {      
      const res = await fetch(url);
      if (res.ok) {
         return res.json()
      } else {
         throw new Error(`Не удалось получить данные по адресу: ${url}`)
      }
   }

   getTestData = () => {
      return this.getData('test.json');
   }

   getTestCard = () => {
      return this.getData('card.json');
   }

   getSearchResult = (query) => {
      this.temp = `${SERVER}search/tv?api_key=${API_KEY}&language=ru-RU&page=1&query=${query}&include_adult=false`
      return this.getData(this.temp);
   }

   getTvShow = (id) => {
      this.temp = `${SERVER}tv/${id}?api_key=${API_KEY}&language=ru-RU`
      return this.getData(this.temp);
   }

   getTopRated = () => {
      this.temp = `${SERVER}tv/top_rated?api_key=${API_KEY}&language=ru-RU`
      return this.getData(this.temp);
   }
   getPopular = () => {
      this.temp = `${SERVER}tv/popular?api_key=${API_KEY}&language=ru-RU`
      return this.getData(this.temp);
   }
   getToday = () => {
      this.temp = `${SERVER}tv/airing_today?api_key=${API_KEY}&language=ru-RU`
      return this.getData(this.temp);
   }
   getWeek = () => {
      this.temp = `${SERVER}tv/on_the_air?api_key=${API_KEY}&language=ru-RU`
      return this.getData(this.temp);
   }
   getNextPage = (page) => {
      return this.getData(this.temp + '&page=' + page);
   }
}

const dbService = new DBService();


const renderCard = (response, target) => {
   tvShowsList.textContent = '';

   
   if (!response.total_results) {
      tvShowsHead.textContent = 'По вашему запросу ничего не найдено!';
      tvShowsHead.style.cssText = 'color: red; display: inline-block; border-bottom: 3px dotted red;';
      loading.remove();
      return;
   }

   tvShowsHead.textContent = target ? target.textContent : 'Результат поиска:';
   tvShowsHead.style.cssText = '';

   response.results.forEach((item) => {
      const { 
         backdrop_path: backdrop,
         name : title, 
         poster_path : poster, 
         vote_average : vote,
         id,
         } = item;
      
      const posterIMG = poster ? IMG_URL + poster : 'img/no-poster.jpg';
      const backdropIMG = backdrop ? IMG_URL + backdrop : '';

      const voteElem = vote ? `<span class="tv-card__vote">${vote}</span>` : ''; //Замена проверке внизу
      
      const card = document.createElement('li');
      card.className = 'tv-shows__item';
      card.innerHTML = `
         <a href="#" id="${id}" class="tv-card">
            ${voteElem}          
            <img class="tv-card__img"
               src="${posterIMG}"
               data-backdrop="${backdropIMG}"
               alt="${title}">
            <h4 class="tv-card__head">${title}</h4>
         </a>
      `;
      // if (!vote) {
      //    card.querySelector('.tv-card__vote').style.display = 'none';
      // }
      loading.remove();
      tvShowsList.append(card);
   })
   pagination.textContent = '';

   if (response.total_pages > 1) {
      if (response.total_pages > 10) {
         for (let i = 1; i <= 10; i++) {
            pagination.innerHTML += `<li><a href=''# class="pages"> ${i} </a></li>`
         }
      } else {
         for (let i = 1; i <= response.total_pages; i++) {
            pagination.innerHTML += `<li><a href=''# class="pages"> ${i} </a></li>`
         }
      }
      
   }
}

searchForm.addEventListener('submit', (event) => {
   event.preventDefault();
   const value = searchFormInput.value.trim();
   if (value) {
      dbService.getSearchResult(value).then(renderCard)
   }
   searchFormInput.value = '';
   

})

const closeDropdown = () => {
   dropdown.forEach((item) => {
      item.classList.remove('active')
   })
}

hamburger.addEventListener('click', () => {
   leftMenu.classList.toggle('openMenu');
   hamburger.classList.toggle('open');
   closeDropdown();
});

document.addEventListener('click', (event) => {
   if (!event.target.closest('.left-menu')) {
      leftMenu.classList.remove('openMenu');
      hamburger.classList.remove('open');
      closeDropdown();
   };
});

leftMenu.addEventListener('click', (event) => {
   const target = event.target;
   const dropdown = target.closest('.dropdown');

   if (dropdown) {
      dropdown.classList.toggle('active');
      leftMenu.classList.add('openMenu');
      hamburger.classList.add('open');
   };

   if (target.closest('#top-rated')) {
      tvShows.append(loading);
      dbService.getTopRated().then((response) => renderCard(response, target))
   }

   if (target.closest('#popular')) {
      tvShows.append(loading);
      dbService.getPopular().then((response) => renderCard(response, target))
   }

   if (target.closest('#today')) {
      tvShows.append(loading);
      dbService.getToday().then((response) => renderCard(response, target))
   }

   if (target.closest('#week')) {
      tvShows.append(loading);
      dbService.getWeek().then((response) => renderCard(response, target))
   }
   
   if (target.closest('#search')) {
      tvShowsList.textContent = '';
      tvShowsHead.textContent = '';
   }
   
   
});

const changeImage = (event) => {
   const card = event.target.closest('.tv-shows__item');

   if (card) {
      const img = card.querySelector('.tv-card__img')
      if (img.dataset.backdrop) {
         [img.src, img.dataset.backdrop] = [img.dataset.backdrop, img.src]
      }
      
   }
};




tvShowsList.addEventListener('mouseover', changeImage);
tvShowsList.addEventListener('mouseout', changeImage);


tvShowsList.addEventListener('click', (event) => {
   event.preventDefault();

   const target = event.target;
   const card = target.closest('.tv-card');
   
   if (card) {
      preloader.style.display = 'block';
      dbService.getTvShow(card.id)
         .then((response) => {
            tvCardImg.src = IMG_URL + response.poster_path;
            modalTitle.textContent = response.name;
            genresList.textContent = '';
            for (const item of response.genres) {
               genresList.innerHTML += `<li>${item.name}</li>`
            }
            //genresList.innerHTML = response.genres.reduce((acc, item) => `${acc}<li>${item.name}</li>`,'')
            rating.textContent = response.vote_average;
            description.textContent = response.overview;
            modalLink.href = response.homepage;
            if (!response.poster_path) {
               posterWrapper.style.display = 'none';
               modalContent.style.paddingLeft = '25px';
            } else {
               posterWrapper.style.display = '';
               modalContent.style.paddingLeft = '';
            }
         })
         .then(() => {            
            document.body.style.overflow = "hidden"
            modal.classList.remove('hide')
         })
         .finally(() => {
            preloader.style.display = '';
         })

   }
})

modal.addEventListener('click', (event) => {
   
   if (event.target.closest('.cross') ||
      event.target.classList.contains('modal')) {
      document.body.style.overflow = "";
      modal.classList.add('hide');
   }
})


pagination.addEventListener('click', (event) => {
   event.preventDefault();
   const target = event.target;
   if (target.classList.contains('pages')) {
      tvShows.append(loading)
      dbService.getNextPage(target.textContent).then(renderCard)
   }
})
