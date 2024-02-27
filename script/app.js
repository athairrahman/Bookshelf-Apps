const books = [];
const RENDER_EVENT = "render-books";
const SAVED_STORAGE_KEY = "books";
const SAVED_EVENT = "saved-books";

// membuat fungsi untuk melihat localStorage dicukung atau tidak oleh webBrowsur
const isLocalStorageSupport = () => {
  if (typeof Storage === undefined) {
    alert("Browsur kamu tidak mendukung local Storage");
    return false;
  }
  return true;
};

// membuat fungsi untuk menyimpan data di localStorage
const booksSave = () => {
  if (isLocalStorageSupport()) {
    const parsed = JSON.stringify(books);
    localStorage.setItem(SAVED_STORAGE_KEY, parsed);
    document.dispatchEvent(new Event(SAVED_EVENT));
  }
};

const generateId = () => {
  return +new Date();
};

// membuat fungsi untuk menampung data book yang diinput
const inputBookObject = (id, title, author, year, isComplete) => {
  return {
    id,
    title,
    author,
    year,
    isComplete,
  };
};

// fungsi untuk melakukan letarasi pada index
const fineBookIndex = (bookId) =>
  books.findIndex((books) => books.id === bookId);

// fungsi hapus buku
const removeBookFromReadBook = (bookId) => {
  const bookTarget = fineBookIndex(bookId);
  if (bookTarget === -1) return;
  books.splice(bookTarget, 1);

  document.dispatchEvent(new Event(RENDER_EVENT));
  booksSave();
};

// fungsi pindahkan buku rak selesai dibaca
const moveBookToCompleted = (bookId) => {
  const bookTarget = fineBookIndex(bookId);
  if (bookTarget === -1) return;
  books[bookTarget].isComplete = true;
  document.dispatchEvent(new Event(RENDER_EVENT));
  booksSave();
};

// fungsi untuk mengembalikan buku ke book yang belum selesai;
const backToBookFromReadBook = (bookId) => {
  const bookTarget = fineBookIndex(bookId);
  if (bookTarget === null) return;
  books[bookTarget].isComplete = false;
  document.dispatchEvent(new Event(RENDER_EVENT));
  booksSave();
};

// fungsi untuk mengambil element judul,penulis, tahun, dan ID
const inputDataBooks = () => {
  const isEditing =
    document.getElementById("bookSubmit").innerText === "Edit Buku";

  const generatedID = generateId();
  const inputBookTitle = document.getElementById("inputBookTitle").value;
  const inputBookAuthor = document.getElementById("inputBookAuthor").value;
  const inputBookYear = parseInt(
    document.getElementById("inputBookYear").value
  );
  const inputBookIsComplete = document.getElementById(
    "inputBookIsComplete"
  ).checked;

  if (isEditing) {
    const bookIndek = books.findIndex((book) => book.id === generatedID);

    if (bookIndek !== -1) {
      books[bookIndek].title = inputBookTitle;
      books[bookIndek].author = inputBookAuthor;
      books[bookIndek].year = inputBookYear;
      books[bookIndek].isComplete = inputBookIsComplete;

      document.getElementById("bookSubmit").innerText =
        "Masukkan Buku ke rak <span>Belum selesai dibaca</span";
      document.getElementById("cancelEditBtn").style.display = "none";
      booksSave();

      // Reset nilai input form
      document.getElementById("inputBookId").value = "";
      document.getElementById("inputBookTitle").value = "";
      document.getElementById("inputBookAuthor").value = "";
      document.getElementById("inputBookYear").value = "";
      document.getElementById("inputBookIsComplete").checked = "";
    }
  } else {
    const bookObject = inputBookObject(
      generatedID,
      inputBookTitle,
      inputBookAuthor,
      inputBookYear,
      inputBookIsComplete
    );

    books.push(bookObject);
    booksSave();
  }
  document.dispatchEvent(new Event(RENDER_EVENT));
};

// fungsi untuk mengload data dari localstorage ketika browsur dibuka kembali
const loadBookFromLocalStorage = () => {
  try {
    const serializedBooks = localStorage.getItem(SAVED_STORAGE_KEY);
    if (serializedBooks === null) {
      return null;
    }
    let parsedBooks = JSON.parse(serializedBooks);

    books.push(...parsedBooks);
    booksSave();
    document.dispatchEvent(new Event(RENDER_EVENT));
    return parsedBooks;
  } catch (error) {
    alert("gagal dimuat data buku", error);
    return null;
  }
};

//fungsi untuk menemukan id buku seseai dengan yang diingin di edit
const bookFromToEdit = (bookId) => {
  // const bookToEdit = books.find((book) => {
  //   return book.id === bookId;
  // });

  const bookToEdit = books.find((book) => book.id === bookId);

  document.getElementById("inputBookId").value = bookToEdit.id;
  document.getElementById("inputBookTitle").value = bookToEdit.title;
  document.getElementById("inputBookAuthor").value = bookToEdit.author;
  document.getElementById("inputBookYear").value = bookToEdit.year;
  document.getElementById("inputBookIsComplete").checked =
    bookToEdit.isComplete;

  const bookSubmit = document.getElementById("bookSubmit");
  bookSubmit.innerText = "Edit Buku";

  const cancelEditBtn = document.getElementById("cancelEditBtn");
  cancelEditBtn.style.display = "inline-block";
};

// fungsi untuk menampilkan data buku yang telah diinput
const displayBook = (dataBook, bookId) => {
  const bookTitle = document.createElement("h3");
  bookTitle.innerText = dataBook.title;

  const bookWriter = document.createElement("p");
  bookWriter.innerText = dataBook.author;

  const bookPublication = document.createElement("p");
  bookPublication.innerText = dataBook.year;

  // fungsi untuk membuat button
  const createButton = (text) => {
    const button = document.createElement("Button");
    button.innerText = text;
    button.classList.add("material-symbols-outlined");
    return button;
  };

  const clearBook = createButton("delete");
  const finisRead = createButton("done");
  const backButton = createButton("undo");

  const editBook = document.createElement("Button");
  editBook.innerText = "Edit";
  editBook.classList.add("edit-button");
  // menambahkan attribute data-book-id untuk menyimpan ID buku
  editBook.dataset.bookId = bookId;

  const action = document.createElement("div");
  action.classList.add("action");
  action.append(clearBook);

  if (dataBook.isComplete) {
    action.append(backButton);
    backButton.addEventListener("click", () => {
      backToBookFromReadBook(dataBook.id);
    });
  } else {
    action.append(finisRead, editBook);
    finisRead.addEventListener("click", () => {
      moveBookToCompleted(dataBook.id);
    });
    editBook.addEventListener("click", () => {
      bookFromToEdit(bookId);
    });
  }
  const containerBookItem = document.createElement("article");
  containerBookItem.classList.add("book_item");
  containerBookItem.append(bookTitle, bookWriter, bookPublication);
  containerBookItem.append(action);
  containerBookItem.setAttribute("id", `book-${dataBook.id}`);

  clearBook.addEventListener("click", () => {
    Swal.fire({
      title: "Apakah anda yakin?",
      text: "Anda tidak dapat mengembalikan lagi!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Ya, hapus saja!",
      cancelButtonText: "Batal",
    }).then((result) => {
      if (result.isConfirmed) {
        removeBookFromReadBook(dataBook.id);
        Swal.fire({
          title: "Terhapus!",
          text: "Buku telah dihapus",
          icon: "success",
        });
      } else {
        Swal.fire({
          title: "Batal!",
          icon: "error",
        });
      }
    });
  });
  return containerBookItem;
};

// fungsi untuk mencari judul buku
const searchBookTitle = document.getElementById("searchBookTitle");
searchBookTitle.addEventListener("input", () => {
  const keyword = searchBookTitle.value.toLowerCase();
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(keyword)
  );
  renderBooks(filteredBooks);
});

// fungsi untuk merender buku pada pencaharian
const renderBooks = (books) => {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompleteBookshelfList.innerHTML = " ";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML = " ";

  books.forEach((book) => {
    const bookElement = displayBook(book);

    if (book.isComplete) {
      completeBookshelfList.appendChild(bookElement);
    } else {
      incompleteBookshelfList.appendChild(bookElement);
    }
  });
};

// Event mengedit buku
bookSubmit.addEventListener("click", () => {
  const bookId = editBook.dataset.bookId;
  bookFromToEdit(bookId);
});

// membuat event submit untuk melakukan penyimpanan data pada form yang telah diinput
document.addEventListener("DOMContentLoaded", () => {
  const inuputAllDataBook = document.getElementById("inputBook");
  inuputAllDataBook.addEventListener("submit", (e) => {
    e.preventDefault();
    Swal.fire({
      text: "Terkirim",
      icon: "success",
    });
    inputDataBooks();
  });

  if (isLocalStorageSupport()) {
    const loadedBooks = loadBookFromLocalStorage();
    if (!loadedBooks) {
      alert("tidak ada buku yang disimpan");
    }
  }
});

// Event untuk merender semua data
document.addEventListener(RENDER_EVENT, () => {
  const incompleteBookshelfList = document.getElementById(
    "incompleteBookshelfList"
  );
  incompleteBookshelfList.innerHTML = " ";

  const completeBookshelfList = document.getElementById(
    "completeBookshelfList"
  );
  completeBookshelfList.innerHTML = " ";

  for (const bookItem of books) {
    const bookElement = displayBook(bookItem);
    if (bookItem.isComplete) {
      completeBookshelfList.append(bookElement);
    } else {
      incompleteBookshelfList.append(bookElement);
    }
  }
});
