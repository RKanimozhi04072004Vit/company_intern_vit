const socket = io();
let pdfDoc = null;
let currentPage = 1;
let totalPages = 0;
let isAdmin = confirm("Are you the admin?"); // Prompt user if they are admin

// URL to your PDF file
const pdfUrl = 'https://example.com/your-pdf-file.pdf';

// Connect to Socket.io room
const sessionId = 'exampleSession'; // You can dynamically generate this for unique sessions
socket.emit('joinRoom', { sessionId, isAdmin });

// Load and Render PDF
const viewer = document.getElementById('viewer');
const currentPageElement = document.getElementById('currentPage');
const totalPagesElement = document.getElementById('totalPages');

// Load PDF
pdfjsLib.getDocument(pdfUrl).promise.then((pdf) => {
  pdfDoc = pdf;
  totalPages = pdf.numPages;
  totalPagesElement.textContent = totalPages;
  renderPage(currentPage);
});

// Render Page
function renderPage(pageNum) {
  pdfDoc.getPage(pageNum).then((page) => {
    const viewport = page.getViewport({ scale: 1.5 });
    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    viewer.innerHTML = ''; // Clear previous content
    viewer.appendChild(canvas);

    page.render({ canvasContext: context, viewport });
    currentPageElement.textContent = currentPage;
  });
}

// Socket listener for page updates
socket.on('pageUpdate', (newPage) => {
  currentPage = newPage;
  renderPage(currentPage);
});

// Navigation controls for admin
if (isAdmin) {
  document.getElementById('prevPage').onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      socket.emit('pageChange', currentPage);
    }
  };

  document.getElementById('nextPage').onclick = () => {
    if (currentPage < totalPages) {
      currentPage++;
      socket.emit('pageChange', currentPage);
    }
  };
} else {
  // Disable controls for non-admin users
  document.getElementById('prevPage').disabled = true;
  document.getElementById('nextPage').disabled = true;
}