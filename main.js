navigator.geolocation.getCurrentPosition(
    position => {
        console.log(position);
        let myLatitude = position.coords.latitude;
        let myLongitude = position.coords.longitude;
        let URL = `https://image.maps.api.here.com/mia/1.6/mapview?app_id=oZmMWRV4tAjQmgkxBvF0&app_code=x5pKHqifhw1mnS_zBTIFsA&z=14&w=600&h=600&c=${position.coords.latitude},${position.coords.longitude}`;
        mapPlace.src = URL;

        //Перевести градусы в радианы
        function degreesToRadians(degrees) {
            return degrees * Math.PI / 180;
        }
        myLatitude = degreesToRadians(myLatitude);
        myLongitude = degreesToRadians(myLongitude);

        //Местоположение банкоматов в Днепре
        async function getATMlocation() {
            let URL_privat_bank = `https://courses.dp.ua/atm/`;
            let answer = await fetch(URL_privat_bank);
            answer = await answer.json();

            for (let i = 0; i < answer.devices.length; i++) {
                let ATMlatitude = +answer.devices[i].latitude;//longitude
                let ATMlongitude = +answer.devices[i].longitude;//latitude

                // let URL = `https://image.maps.api.here.com/mia/1.6/mapview?app_id=oZmMWRV4tAjQmgkxBvF0&app_code=x5pKHqifhw1mnS_zBTIFsA&z=16&w=600&h=600&c=${ATMlongitude},${ATMlatitude}`;
                // mapPlace.src = URL;

                ATMlatitude = degreesToRadians(ATMlatitude);
                ATMlongitude = degreesToRadians(ATMlongitude);

                //Кратчайшее расстояние между двумя точками на земной поверхности (если принять ее за сферу) 
                //http://osiktakan.ru/geo_koor.htm#:~:text=%D0%B3%D0%B4%D0%B5%20%CF%86%D0%90%20%D0%B8%20%CF%86,%D0%BA%D0%BC%20%E2%80%94%20%D1%81%D1%80%D0%B5%D0%B4%D0%BD%D0%B8%D0%B9%20%D1%80%D0%B0%D0%B4%D0%B8%D1%83%D1%81%20%D0%B7%D0%B5%D0%BC%D0%BD%D0%BE%D0%B3%D0%BE%20%D1%88%D0%B0%D1%80%D0%B0.
                let cosX = Math.sin(myLatitude) * Math.sin(ATMlongitude) + Math.cos(myLatitude) * Math.cos(ATMlongitude) * Math.cos(myLongitude - ATMlatitude);
                distanceX = Math.acos(cosX);
                if (distanceX < 0 || distanceX > 3.14) {
                    console.log("Error! Distance may be 0 <= distanceX <= pi")
                } else {
                    //Расстояние между пунктами, измеряемое в километрах
                    const radius = 6371; //км — средний радиус земного шара
                    let L = distanceX * radius;//км
                    L = Math.floor(L * 1000);//м
                    answer.devices[i].distanceToPerson = L;
                }
            }

            //Сортировка
            answer.devices.sort(function (current, next) {
                return current.distanceToPerson - next.distanceToPerson;
            });

            let numberOfNearestATMs = 5;
            for (let i = 0; i < numberOfNearestATMs; i++) {
                let result = `${i + 1} Адрес: ${answer.devices[i].fullAddressRu} 
Расстояние до пользователя: ${answer.devices[i].distanceToPerson} м`;
                console.log(result);
            }

        }
        getATMlocation();
    },
    error => console.log('Error!', error)
)
