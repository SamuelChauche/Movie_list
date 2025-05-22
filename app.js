import { apikey } from './config.js'
const API_KEY = apikey;
const API_URL = 'https://www.omdbapi.com/';
const form = document.getElementById('search-form');
const input = document.getElementById('search-input');
const movieList = document.getElementById('movies-list');
const sentinel = document.getElementById('sentinel');

let searchTerm = '';
let page = 1;
let loading = false;

form.addEventListener('submit', e => {
    e.preventDefault();
    searchTerm = input.value.trim();
    page = 1;
    movieList.innerHTML = '';
    fetchMovies();
});

async function fetchMovies() {
    if (loading || !searchTerm) return;
    loading = true;
    const res = await fetch(`${API_URL}?apikey=${API_KEY}&s=${encodeURIComponent(searchTerm)}&page=${page}`);
    const data = await res.json();

    if (data.Search) {
        data.Search.forEach(movie => {
            const card = document.createElement('div');
            card.className = 'movie-card';

            card.innerHTML = `
            <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'https://via.placeholder.com/150'}" alt="${movie.Title}">
            <h3>${movie.Title}</h3>
            <p>${movie.Year}</p>
            <button class="read-more-btn">Read more</button>
            `;

            const button = card.querySelector('.read-more-btn');
            button.addEventListener('click', () => fetchMovieDetails(movie.imdbID));

            movieList.appendChild(card);
        });

        page++;
    } else if (page === 1) {
        movieList.innerHTML = '<p>Aucun résultat trouvé.</p>';
    }

    loading = false;
}

// Détails d’un film
window.fetchMovieDetails = async function (imdbID) {
    const res = await fetch(`${API_URL}?apikey=${API_KEY}&i=${imdbID}`);
    const data = await res.json();

    // Remplir la modale avec les données du film
    document.getElementById('modal-title').textContent = data.Title;
    document.getElementById('modal-release').textContent = data.Released;
    document.getElementById('modal-plot').textContent = data.Plot;

    // Afficher la modale
    document.getElementById('modal').classList.remove('hidden');
};

// Intersection Observer pour scroll infini
const observer = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
        fetchMovies();
    }
}, {
    rootMargin: '200px',
});

observer.observe(sentinel);

document.getElementById('modal-close').addEventListener('click', () => {
    document.getElementById('modal').classList.add('hidden');
});

// Bonus : fermer en cliquant en dehors du contenu
document.getElementById('modal').addEventListener('click', (e) => {
    if (e.target.id === 'modal') {
        document.getElementById('modal').classList.add('hidden');
    }
});
