function toggleMenu() {
    const navLinks = document.getElementById('navLinks');
    navLinks.classList.toggle('active');
}

let currentPage = 1;
let totalPages = 1;
let chapterData = []; 

async function loadChapter() {
    try {
        let chapterNum = window.location.hash.substring(1);
        if (!chapterNum) chapterNum = "1";

        const response = await fetch('../data.json');
        chapterData = await response.json();

        const targetIndex = parseInt(chapterNum) - 1;
        
        if (targetIndex < 0 || targetIndex >= chapterData.length) {
            document.getElementById('breadcrumbs').innerText = "Chapter not found!";
            return;
        }

        const chapter = chapterData[targetIndex];

        // --- SETUP SHARE BUTTONS ---
        const currentUrl = window.location.href.split('#')[0] + '#' + chapterNum;
        const shareText = `Check out ${chapter.title} on Kenjutsu No Kadai!`;

        const xBtn = document.querySelector('.share-icon:nth-child(1)');
        xBtn.onclick = (e) => {
            e.preventDefault();
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(currentUrl)}`, '_blank');
        };

        const fbBtn = document.querySelector('.share-icon:nth-child(2)');
        fbBtn.onclick = (e) => {
            e.preventDefault();
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(currentUrl)}`, '_blank');
        };

        const redditBtn = document.querySelector('.share-icon:nth-child(3)');
        redditBtn.onclick = (e) => {
            e.preventDefault();
            window.open(`https://www.reddit.com/submit?url=${encodeURIComponent(currentUrl)}&title=${encodeURIComponent(shareText)}`, '_blank');
        };

        const linkBtn = document.querySelector('.share-icon:nth-child(4)');
        linkBtn.onclick = (e) => {
            e.preventDefault();
            navigator.clipboard.writeText(currentUrl).then(() => {
                const originalText = linkBtn.innerHTML;
                linkBtn.innerHTML = '✓';
                setTimeout(() => {
                    linkBtn.innerHTML = originalText;
                }, 2000);
            }).catch(() => {
                alert('Could not copy link automatically. Please copy the URL from your browser.');
            });
        };
        // ------------------------------------

        document.getElementById('breadcrumbs').innerHTML = `
            Home <span>&gt;</span> Chapters <span>&gt;</span> ${chapter.arc_name} <span>&gt;</span> ${chapter.title}
        `;

        document.getElementById('chapter-header').style.backgroundImage = `url(${chapter.arc_image})`;
        document.getElementById('chapter-header').style.backgroundSize = 'cover';
        document.getElementById('chapter-header').style.backgroundPosition = 'center';

        document.getElementById('chapter-header').innerHTML = `
            <div class="arc-tag">${chapter.arc_name}</div>
            <div class="header-text-content">
                <h1>${chapter.title}</h1>
                <div class="sub">"${chapter.desc}"</div>
                <div class="header-stats">
                    <span>🗒 ${chapter.date}</span>
                </div>
            </div>
        `;

        document.getElementById('info-grid').innerHTML = `
            <div class="row"><span>Arc:</span> <span>${chapter.arc_name}</span></div>
            <div class="row"><span>Released:</span> <span>${chapter.date}</span></div>
            <div class="row"><span>Pages:</span> <span id="sidebar-page-count">...</span></div>
        `;
        document.getElementById('info-summary').innerHTML = `
            <strong>Summary:</strong><br>
            ${chapter.desc}
        `;

        const sidebarList = document.getElementById('sidebar-list');
        sidebarList.innerHTML = '';
        
        chapterData.forEach((ch, index) => {
            const li = document.createElement('li');
            const chNum = index + 1;
            if (chNum === parseInt(chapterNum)) {
                li.className = 'active';
            }
            li.innerHTML = `
                <span><span class="chap-num">${chNum}.</span> ${ch.title.replace(`Chapter ${chNum}: `, '')}</span>
                <span class="chap-date">${ch.date}</span>
            `;
            li.onclick = () => {
                window.location.href = `#${chNum}`;
            };
            sidebarList.appendChild(li);
        });

        const chapterDropdown = document.querySelector('.control-select');
        chapterDropdown.innerHTML = '';
        chapterData.forEach((ch, index) => {
            const opt = document.createElement('option');
            opt.value = index + 1;
            opt.innerText = ch.title;
            if ((index + 1) === parseInt(chapterNum)) {
                opt.selected = true;
            }
            chapterDropdown.appendChild(opt);
        });
        
        chapterDropdown.onchange = function() {
            window.location.href = `#${this.value}`;
        };

        const pageDropdown = document.querySelectorAll('.control-select')[1];
        pageDropdown.innerHTML = '';

        const topPrevBtn = document.querySelector('.control-group:first-child .control-btn');
        const topNextBtn = document.querySelector('.control-group:last-child .control-btn.primary');

        const pagesContainer = document.getElementById('manga-pages');
        pagesContainer.innerHTML = '';

        const manifestPath = `../pages/ch${chapterNum}/manifest.txt`;
        
        try {
            const manifestResponse = await fetch(manifestPath);
            if (!manifestResponse.ok) throw new Error("Manifest not found");

            const manifestText = await manifestResponse.text();
            const imageFiles = manifestText.split('\n').filter(line => line.trim() !== '');

            totalPages = imageFiles.length;
            currentPage = 1;

            document.getElementById('page-count').innerText = `Page ${currentPage} of ${totalPages}`;
            document.getElementById('sidebar-page-count').innerText = totalPages;

            for (let i = 1; i <= totalPages; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerText = `Page ${i}`;
                pageDropdown.appendChild(opt);
            }

            pageDropdown.onchange = function() {
                goToPage(parseInt(this.value));
            };

            imageFiles.forEach((filename, index) => {
                const img = document.createElement('img');
                img.className = 'manga-page-img';
                img.src = `../pages/ch${chapterNum}/${filename}`;
                img.alt = `Page ${filename}`;
                img.style.display = 'none';
                if (index === 0) {
                    img.style.display = 'block';
                }
                pagesContainer.appendChild(img);
            });

            updateNavButtons(topPrevBtn, topNextBtn);

        } catch (manifestError) {
            console.warn("No manifest found, using placeholders.");
            totalPages = 3;
            currentPage = 1;
            document.getElementById('page-count').innerText = `Page ${currentPage} of ${totalPages}`;
            document.getElementById('sidebar-page-count').innerText = totalPages;

            for (let i = 1; i <= 3; i++) {
                const opt = document.createElement('option');
                opt.value = i;
                opt.innerText = `Page ${i}`;
                pageDropdown.appendChild(opt);
            }
            pageDropdown.onchange = function() {
                goToPage(parseInt(this.value));
            };

            for (let i = 1; i <= 3; i++) {
                const img = document.createElement('img');
                img.className = 'manga-page-img';
                img.src = `../src/knkbanner.png`;
                img.alt = `Page ${i}`;
                img.style.display = i === 1 ? 'block' : 'none';
                pagesContainer.appendChild(img);
            }
            updateNavButtons(topPrevBtn, topNextBtn);
        }

        function updateNavButtons(prevBtn, nextBtn) {
            const allPrevBtns = document.querySelectorAll('.page-nav-btn:first-child');
            const allNextBtns = document.querySelectorAll('.page-nav-btn:last-child');
            
            if (prevBtn) prevBtn.disabled = (currentPage <= 1);
            if (nextBtn) nextBtn.disabled = (currentPage >= totalPages);

            allPrevBtns.forEach(btn => {
                if (currentPage <= 1) btn.classList.add('disabled');
                else btn.classList.remove('disabled');
            });
            allNextBtns.forEach(btn => {
                if (currentPage >= totalPages) btn.classList.add('disabled');
                else btn.classList.remove('disabled');
            });
        }

        function goToPage(pageNum) {
            if (pageNum < 1 || pageNum > totalPages) return;
            
            const images = document.querySelectorAll('.manga-page-img');
            if (images[currentPage - 1]) images[currentPage - 1].style.display = 'none';

            currentPage = pageNum;
            if (images[currentPage - 1]) images[currentPage - 1].style.display = 'block';

            document.getElementById('page-count').innerText = `Page ${currentPage} of ${totalPages}`;
            pageDropdown.value = currentPage;
            
            const allPrevBtns = document.querySelectorAll('.page-nav-btn:first-child');
            const allNextBtns = document.querySelectorAll('.page-nav-btn:last-child');

            allPrevBtns.forEach(btn => {
                if (currentPage <= 1) btn.classList.add('disabled');
                else btn.classList.remove('disabled');
            });
            allNextBtns.forEach(btn => {
                if (currentPage >= totalPages) btn.classList.add('disabled');
                else btn.classList.remove('disabled');
            });

            document.querySelector('.content-area').scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        document.querySelectorAll('.page-nav-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.preventDefault();
                if (btn.classList.contains('disabled')) return;
                
                if (btn.innerText.includes('PREV')) {
                    goToPage(currentPage - 1);
                } else if (btn.innerText.includes('NEXT')) {
                    goToPage(currentPage + 1);
                }
            };
        });

        if (topPrevBtn) {
            topPrevBtn.onclick = (e) => {
                if (topPrevBtn.disabled) return;
                goToPage(currentPage - 1);
            };
        }
        if (topNextBtn) {
            topNextBtn.onclick = (e) => {
                if (topNextBtn.disabled) return;
                goToPage(currentPage + 1);
            };
        }

    } catch (error) {
        console.error("Error loading chapter:", error);
        document.getElementById('breadcrumbs').innerText = "Error loading data.json";
    }
}

window.addEventListener('hashchange', loadChapter);
loadChapter();