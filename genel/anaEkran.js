document.addEventListener('DOMContentLoaded', function() {
    const apiKey = 'YOUR_API_KEY'; // OpenWeatherMap API anahtarınızı buraya ekleyin
    const city = 'Istanbul'; // Varsayılan şehir
    const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=metric&appid=${apiKey}`;

    fetch(url)
        .then(response => response.json())
        .then(data => {
            const havaDurumuDiv = document.querySelector('.havaDurumuTahmini');
            const tahminler = data.list.slice(0, 5); // İlk 5 tahmini al

            tahminler.forEach(tahmin => {
                const gunDiv = document.createElement('div');
                gunDiv.classList.add('gun');

                const tarih = new Date(tahmin.dt_txt);
                const gunAdi = tarih.toLocaleDateString('tr-TR', { weekday: 'long' });

                gunDiv.innerHTML = `
                    <div>${gunAdi}</div>
                    <img src="http://openweathermap.org/img/wn/${tahmin.weather[0].icon}.png" alt="Hava Durumu">
                    <div>${tahmin.main.temp}°C</div>
                `;

                havaDurumuDiv.appendChild(gunDiv);
            });
        })
        .catch(error => console.error('Hava durumu verisi alınamadı:', error));
});