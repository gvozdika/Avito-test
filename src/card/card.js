import {repoSvg, starSvg, commitSvg} from '../img/iconsSvg.js';

const repoId = sessionStorage.getItem('id');
const repoUrl = `https://api.github.com/repositories/${repoId}`;
const card = document.querySelector('.card');

const repoInfo = {};

async function getData(url) {
    const data = await (await fetch(url)).json();

    repoInfo.name = data.full_name;
    repoInfo.stars = data.stargazers_count;
    repoInfo.lastCommit = data.pushed_at ? data.pushed_at.split("T")[0] : '-';
    repoInfo.avatarUrl = data.owner.avatar_url;
    repoInfo.login = data.owner.login;
    repoInfo.userUrl = data.owner.html_url;
    repoInfo.desc = data.description ? data.description : '-';
    repoInfo.languages = Object.keys(await (await fetch(data.languages_url)).json());

    const response = await fetch(data.contributors_url)
    const allContributors = response.status == 200 ? (await response.json()) : [];

    repoInfo.top10Contributors = [];

    for (let i = 0; i < 10; i++) {

        if (allContributors[i] === undefined) {
            break
        } else {
            repoInfo.top10Contributors.push({
                login: allContributors[i].login,
                avatarUrl: allContributors[i].avatar_url,
                url: allContributors[i].html_url
            })
        }
    }
}


async function renderCard() {

    await getData(repoUrl);

    const cardInner = `
    <div class = "repo">
        <h2 class="repoName">${repoSvg}${repoInfo.name.split('/').join(' / ')}</h2>
        <div class="repoStars">${starSvg}${repoInfo.stars}</div>
        <div class="repoLastCommit">${commitSvg}${repoInfo.lastCommit}</div>
        <div class="description">${repoInfo.desc}</div>
        <div class="languages">
            <p class="languages__list">Languages: ${repoInfo.languages.length ? repoInfo.languages.join(', ') : '-'}</p>
        </div>
        <div class="contributors">
            <ul class="contributors__list"></ul>
        </div>
    </div>
    <div class="user">
        <div class="user__avatar"><img src = ${repoInfo.avatarUrl}></div>
        <div class="user__nickname"><a href=${repoInfo.userUrl}>${repoInfo.login}</a></div>
    </div>`
    card.insertAdjacentHTML('beforeend', cardInner);
    renderContributors();

}

function renderContributors() {
    const contributorsList = document.querySelector('.contributors__list');
    repoInfo.top10Contributors.forEach(el => {
        const contributor = `<li class="contributors__item">
                                <a href = ${el.url} title=${el.login}><img src = ${el.avatarUrl}></a>
                            </li>`;
        contributorsList.insertAdjacentHTML('beforeend', contributor);
    })

}

renderCard(repoUrl);