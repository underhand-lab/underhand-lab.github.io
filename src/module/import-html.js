export function loadExternalHtml() {
    const containers = document.getElementsByClassName('html-container');
    const promises = []; // 모든 fetch 작업을 담을 배열

    for (let i = 0; i < containers.length; i++) {
        const container = containers[i];
        const filePath = container.getAttribute('data-src');

        if (filePath) {
            // fetch 자체를 배열에 push (Promise 객체 상태)
            const fetchPromise = fetch(filePath)
                .then(response => {
                    if (!response.ok) throw new Error(`실패: ${response.statusText}`);
                    return response.text();
                })
                .then(html => {
                    container.innerHTML = html;
                })
                .catch(error => {
                    console.error(error);
                    container.innerHTML = `<p style="color:red;">로딩 실패</p>`;
                });
            
            promises.push(fetchPromise);
        }
    }

    // 모든 Promise가 완료될 때까지 기다리는 Promise 반환
    return Promise.all(promises);
}

await loadExternalHtml();