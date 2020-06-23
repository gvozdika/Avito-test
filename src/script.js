import {
    repoSvg,
    starSvg,
    commitSvg,
    linkSvg
} from './img/iconsSvg.js';

const defaultUrl = 'https://api.github.com/search/repositories?q=stars:%3E=100000&sort=stars&order=desc&&per_page=10';

const githubIcon = document.querySelector('.search svg');
const searchInput = document.querySelector('.search-input');
const list = document.querySelector('.repoList ul');
const loading = document.querySelector('.loading');
const pagination = document.querySelector('.pagination');

let defaultRepos = sessionStorage.getItem('defaultRepos') ? JSON.parse(sessionStorage.getItem('defaultRepos')) : [];
let searchedRepos = sessionStorage.getItem('lastSearch') ? JSON.parse(sessionStorage.getItem('lastSearch')) : [];
let currentPage = sessionStorage.getItem('currentPage') ? JSON.parse(sessionStorage.getItem('currentPage')) : 1;
let prevPage

let isVisited = sessionStorage.getItem('isVisited');


// renderSearchResult(defaultUrl, defaultRepos);

if (isVisited) {

    searchedRepos.length ? renderRepos(searchedRepos) : renderRepos(defaultRepos);
    searchedRepos.length > 10 && renderPagination(searchedRepos);

} else {
    renderSearchResult(defaultUrl, defaultRepos);
}


searchInput.addEventListener('keyup', (e) => {
    if (e.keyCode == 13) {
        list.innerHTML = '';
        pagination.innerHTML = '';
        searchedRepos = [];
        currentPage = 1;

        searchInput.value ?
            renderSearchResult(`https://api.github.com/search/repositories?q=${searchInput.value}in:name&sort=stars&order=desc&per_page=100`, searchedRepos) :
            renderRepos(defaultRepos) || sessionStorage.setItem('lastSearch', JSON.stringify(defaultRepos))
    }
})

async function renderSearchResult(url, repos) {

    const data = await getData(url, repos);
    if (sessionStorage.getItem('isVisited')) {
        sessionStorage.setItem('lastSearch', JSON.stringify(data))
    } else {
        sessionStorage.setItem('isVisited', true)
        sessionStorage.setItem('defaultRepos', JSON.stringify(data))
    }

    renderRepos(data);
    data.length > 10 && renderPagination(data);
}

async function getData(url, repos) {

    githubIcon.style.color = '#24292e';
    loading.style.display = 'block';
    let data = await (await fetch(url)).json();
    if (data.total_count) {

        data.items.forEach(repo => {

            const lastCommit = repo.pushed_at ? repo.pushed_at.split("T")[0] : '-'

            repos.push({
                id: repo.id,
                name: repo.full_name,
                stars: repo.stargazers_count,
                lastCommit: lastCommit,
                link: repo.owner.html_url
            })
        })
    } else {
        repos = [...defaultRepos];
        currentPage = 1
        sessionStorage.setItem('currentPage', currentPage)
    }
    
    return repos
}

function renderRepos(repos) {
    githubIcon.style.color = '#fff';
    loading.style.display = 'none';

    //how to improve?)))
    const lastRepoNum = currentPage * 10 <= repos.length ? currentPage * 10 : (currentPage - 1) * 10 + repos.length % 10;

    for (let i = (currentPage - 1) * 10; i < lastRepoNum; i++) {
        const repo = `
                <li class="repo">
                    <div class = "repoName">${repoSvg}<a href = "./src/card/card.html" id = "${repos[i].id}">${repos[i].name.split('/').join(' / ')}</a></div> 
                    <div class = "repoStars">${starSvg}${repos[i].stars}</div>
                    <div class = "repoLastCommit">${commitSvg}${repos[i].lastCommit}</div>
                    <div class = "repoGithub">${linkSvg}<a href = "${repos[i].link}">link</a></div>
                </li>`
        list.insertAdjacentHTML('beforeend', repo);
    }
}

function renderPagination(repos) {

    pagination.innerHTML = '';
    const pages = Math.ceil(repos.length / 10);

    pagination.insertAdjacentHTML("beforeend", '[')
    for (let i = 1; i < pages + 1; i++) {
        const paginationPage = `<button class = "pagination__page">${i}</button>${i=== pages ? '' : ', '}`;
        pagination.insertAdjacentHTML("beforeend", paginationPage)
    }
    pagination.insertAdjacentHTML("beforeend", ']')
    document.querySelectorAll('.pagination__page') && document.querySelectorAll('.pagination__page')[currentPage - 1].classList.add('currentPage');
}

document.addEventListener('click', (e) => {
    if (e.target.href && e.target.href.match('card.html')) {
        sessionStorage.setItem('id', e.target.id)
    } else if (e.target.className == "pagination__page") {
        prevPage = currentPage;
        currentPage = parseInt(e.target.innerHTML);
        sessionStorage.setItem('currentPage', currentPage)
        list.innerHTML = '';

        document.querySelectorAll('.pagination__page')[currentPage - 1].classList.add('currentPage');
        prevPage && document.querySelectorAll('.pagination__page')[prevPage - 1].classList.remove('currentPage');

        renderRepos(searchedRepos);
    }
})