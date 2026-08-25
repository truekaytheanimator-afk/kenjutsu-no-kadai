const CHAPTERS_PER_LOAD = 8; 
let currentDisplayCount = 0;
let allChaptersData = [];

const container = document.getElementById('chapter-list-container');
const loadMoreBtn = document.getElementById('load-more-btn');

async function setupLatestChapterBtn() {
    try {
        const response = await fetch('data.json');
        const data = await response.json();
        const latestChapterNum = data.length; 
        const latestBtn = document.querySelector('.btn-read');
        if (latestBtn) {
            latestBtn.href = `chapter/#${latestChapterNum}`;
        }
    } catch (error) {
        console.error("Could not set latest chapter link:", error);
    }
}

async function loadChapters() {
    try {
        const response = await fetch('data.json');
        const originalData = await response.json();
        allChaptersData = originalData.reverse();
        loadNextBatch();
    } catch (error) {
        console.error("Error loading chapter data:", error);
        container.innerHTML = "<p style='color:red;'>Failed to load chapters.</p>";
    }
}

function loadNextBatch() {
    const nextBatch = allChaptersData.slice(currentDisplayCount, currentDisplayCount + CHAPTERS_PER_LOAD);

    nextBatch.forEach((chapter, index) => {
        const row = document.createElement('div');
        row.className = 'chapter-row';
        const chapterNum = allChaptersData.length - (currentDisplayCount + index);

        row.innerHTML = `
            <div class="chapter-info">
                <h4 class="chapter-title">${chapter.title}</h4>
                <p class="chapter-desc">${chapter.desc}</p>
            </div>
            <div class="chapter-date">${chapter.date}</div>
            <a href="chapter/#${chapterNum}" class="chapter-btn">READ</a>
        `;

        container.appendChild(row);
    });

    currentDisplayCount += nextBatch.length;

    if (currentDisplayCount >= allChaptersData.length) {
        loadMoreBtn.style.display = 'none';
    } else {
        loadMoreBtn.style.display = 'block';
    }
}

loadMoreBtn.addEventListener('click', loadNextBatch);

setupLatestChapterBtn();
loadChapters();

function highlight(id) {
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}

function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

// --- NEW: VIEW ALL CHAPTERS FUNCTION ---
function viewAllChapters() {
    // 1. Hide the Load More button immediately
    loadMoreBtn.style.display = 'none';

    // 2. Calculate how many chapters are left to load
    const remainingCount = allChaptersData.length - currentDisplayCount;

    if (remainingCount > 0) {
        // 3. Load all remaining chapters at once
        const nextBatch = allChaptersData.slice(currentDisplayCount, currentDisplayCount + remainingCount);

        nextBatch.forEach((chapter, index) => {
            const row = document.createElement('div');
            row.className = 'chapter-row';
            const chapterNum = allChaptersData.length - (currentDisplayCount + index);

            row.innerHTML = `
                <div class="chapter-info">
                    <h4 class="chapter-title">${chapter.title}</h4>
                    <p class="chapter-desc">${chapter.desc}</p>
                </div>
                <div class="chapter-date">${chapter.date}</div>
                <a href="chapter/#${chapterNum}" class="chapter-btn">READ</a>
            `;

            container.appendChild(row);
        });

        // Update the count so it knows we're done
        currentDisplayCount += remainingCount;
    }

    // 4. Smooth scroll to the top of the chapter list
    container.scrollIntoView({ behavior: 'smooth' });
}

// --- FANART LOGIC ---
const fanartList = [
    { file: "image1.png", artist: "@mecauseafter" },
    { file: "image2.png", artist: "@mecauseafter" },
    { file: "image3.png", artist: "@..." }
];

let currentArtIndex = 0;
let rotationInterval;

function initFanart() {
    const container = document.getElementById('fanartContainer');
    const credit = document.getElementById('fanartCredit');
    
    container.innerHTML = '';

    if (fanartList.length === 0) {
        container.innerHTML = '<div style="color:#666;">No fanart added yet!</div>';
        return;
    }

    fanartList.forEach((art, index) => {
        const img = document.createElement('img');
        img.src = `fanart/${art.file}`;
        img.alt = `Fanart by ${art.artist}`;
        if (index === 0) img.classList.add('active');
        container.appendChild(img);
    });

    credit.textContent = `Art by: ${fanartList[0].artist}`;
    startRotation();
}

function showArt(index) {
    const images = document.querySelectorAll('.fanart-image-container img');
    const credit = document.getElementById('fanartCredit');

    images.forEach(img => img.classList.remove('active'));

    if (images[index]) {
        images[index].classList.add('active');
        credit.textContent = `Art by: ${fanartList[index].artist}`;
    }
}

function nextArt() {
    currentArtIndex = (currentArtIndex + 1) % fanartList.length;
    showArt(currentArtIndex);
}

function startRotation() {
    if (rotationInterval) clearInterval(rotationInterval);
    rotationInterval = setInterval(nextArt, 8000);
}

function refreshFanart() {
    nextArt();
    startRotation();
}

initFanart();