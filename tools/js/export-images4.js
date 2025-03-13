document.getElementById('generate-button').addEventListener('click', function () {
    const textInput = document.getElementById('text-input').value;
    const sentences = textInput.split('#');
    const resolution = document.getElementById('resolution').value;
    const [width, height] = resolution.split('x').map(Number);
    const fontSize = document.getElementById('font-size').value + 'px';
    const fontColor = document.getElementById('font-color').value;
    const bgColor = document.getElementById('bg-color').value;
    const bgImageInput = document.getElementById('bg-image');
    const imageContainer = document.getElementById('image-container');
    imageContainer.innerHTML = '';

    let bgImageUrl = null;
    if (bgImageInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = function (e) {
            const img = new Image();
            img.src = e.target.result;
            img.onload = function () {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                canvas.width = width;
                canvas.height = height;

                const imageAspectRatio = img.width / img.height;
                const containerAspectRatio = width / height;

                let drawWidth, drawHeight, drawX, drawY;

                if (imageAspectRatio > containerAspectRatio) {
                    drawHeight = height;
                    drawWidth = height * imageAspectRatio;
                    drawX = (width - drawWidth) / 2;
                    drawY = 0;
                } else {
                    drawWidth = width;
                    drawHeight = width / imageAspectRatio;
                    drawX = 0;
                    drawY = (height - drawHeight) / 2;
                }

                ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
                bgImageUrl = canvas.toDataURL('image/png');
                processSentences(bgImageUrl);
            };
        };
        reader.readAsDataURL(bgImageInput.files[0]);
    } else {
        processSentences(null);
    }

    function processSentences(bgImageUrl) {
        sentences.forEach((sentence, index) => {
            const div = document.createElement('div');
            div.style.width = `${width}px`;
            div.style.height = `${height}px`;
            div.style.border = '1px solid #ccc';
            div.style.display = 'flex';
            div.style.justifyContent = 'center';
            div.style.alignItems = 'center';
            div.style.textAlign = 'center';
            div.style.fontSize = fontSize;
            div.style.color = fontColor;
            if (bgImageUrl) {
                div.style.backgroundImage = `url(${bgImageUrl})`;
            } else {
                div.style.backgroundColor = bgColor;
            }
            div.style.padding = '80px';
            div.textContent = sentence;

            const imgElement = document.createElement('img');
            imgElement.id = `image-${index}`;
            imgElement.classList.add('preview-image');
            imgElement.style.display = 'none';

            const exportButton = document.createElement('button');
            exportButton.textContent = `导出第 ${index + 1} 张`;
            exportButton.addEventListener('click', function () {
                exportImage(div, `image-${index + 1}.png`);
            });

            imageContainer.appendChild(div);
            imageContainer.appendChild(imgElement);
            // imageContainer.appendChild(exportButton);

            html2canvas(div, {
                useCORS: true
            }).then(canvas => {
                imgElement.src = canvas.toDataURL('image/png');
                imgElement.style.display = 'block';
                div.style.display = 'none';
            });
        });

        document.getElementById('export-all-button').disabled = false;
    }
});

document.getElementById('export-all-button').addEventListener('click', function () {
    const imageContainer = document.getElementById('image-container');
    const images = imageContainer.getElementsByTagName('img');
    Array.from(images).forEach((img, index) => {
        const link = document.createElement('a');
        link.href = img.src;
        link.download = `image-${index + 1}.png`;
        link.click();
    });
});

function exportImage(element, filename) {
    html2canvas(element, {
        useCORS: true
    }).then(canvas => {
        canvas.toBlob(blob => {
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = filename;
            link.click();
            URL.revokeObjectURL(link.href);
        }, 'image/png');
    });
}