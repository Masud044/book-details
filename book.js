

let books = [];
let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
let currentPage = 1;
const booksPerPage = 10;

const fetchBooks = async () => {
  const res = await fetch('https://gutendex.com/books');
  const data = await res.json();
  books = data.results;
  populateGenres();
  displayBooks();
};

const populateGenres = () => {
  const genres = new Set();
  books.forEach(book => {
    book.subjects.forEach(subject => genres.add(subject));
  });
  const genreFilter = document.getElementById('genreFilter');
  genres.forEach(genre => {
    const option = document.createElement('option');
    option.value = genre;
    option.textContent = genre;
    genreFilter.appendChild(option);
  });
};

const displayBooks = () => {
  const list = document.getElementById('bookList');
  const searchValue = document.getElementById('searchBar').value.toLowerCase();
  const genreValue = document.getElementById('genreFilter').value;

  let filteredBooks = books.filter(book =>
    book.title.toLowerCase().includes(searchValue) &&
    (genreValue === '' || book.subjects.includes(genreValue))
  );

  const start = (currentPage - 1) * booksPerPage;
  const end = start + booksPerPage;
  const paginatedBooks = filteredBooks.slice(start, end);

  list.innerHTML = paginatedBooks.map(book => `
    <div class="book">
      <div class="wishlist-icon" onclick="toggleWishlist(${book.id})">
        ${wishlist.includes(book.id) ? '❤️' : '🤍'}
      </div>
      <img src="${book.formats['image/jpeg']}" alt="${book.title}" />
      <h4>${book.title}</h4>
      <p>Author: ${book.authors.map(a => a.name).join(', ')}</p>
      <p>Genre: ${book.subjects[0] || 'N/A'}</p>
      <p>ID: ${book.id}</p>
    </div>
  `).join('');

  renderPagination(filteredBooks.length);
};

const renderPagination = (totalBooks) => {
  const pages = Math.ceil(totalBooks / booksPerPage);
  const pagination = document.getElementById('pagination');
  pagination.innerHTML = '';
  for (let i = 1; i <= pages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.onclick = () => {
      currentPage = i;
      displayBooks();
    };
    pagination.appendChild(btn);
  }
};

const toggleWishlist = (id) => {
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter(wid => wid !== id);
  } else {
    wishlist.push(id);
  }
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  displayBooks();
  showWishlist();
};

const showWishlist = () => {
  const wishPage = document.getElementById('wishlistPage');
  const booksToShow = books.filter(b => wishlist.includes(b.id));
  wishPage.innerHTML = booksToShow.map(book => `
    <div class="book">
      <div class="wishlist-icon" onclick="toggleWishlist(${book.id})">❤️</div>
      <img src="${book.formats['image/jpeg']}" alt="${book.title}" />
      <h4>${book.title}</h4>
      <p>Author: ${book.authors.map(a => a.name).join(', ')}</p>
      <p>Genre: ${book.subjects[0] || 'N/A'}</p>
      <p>ID: ${book.id}</p>
    </div>
  `).join('');
};

const showPage = (page) => {
  document.getElementById('bookList').style.display = page === 'home' ? 'flex' : 'none';
  document.getElementById('pagination').style.display = page === 'home' ? 'block' : 'none';
  document.getElementById('wishlistPage').style.display = page === 'wishlist' ? 'flex' : 'none';
  if (page === 'wishlist') showWishlist();
};

document.getElementById('searchBar').addEventListener('input', () => {
  currentPage = 1;
  displayBooks();
});

document.getElementById('genreFilter').addEventListener('change', () => {
  currentPage = 1;
  displayBooks();
});

fetchBooks();
