const startingLoc = {lat: 54.8985, lng: 23.9036};
let map, places, infoWindow;
let markers = [];
let autocomplete;
let MARKER_PATH = 'https://developers.google.com/maps/documentation/javascript/images/marker_green';
let hostnameRegexp = new RegExp('^https?://.+?/');
let option;

let placeSelector = document.getElementById("place-selector");

placeSelector.addEventListener("change", function () {
    option = placeSelector.options[placeSelector.selectedIndex].value;
    search(option);
});

autocomplete = new google.maps.places.Autocomplete(
    (document.getElementById('autocomplete')), {
        types: ['(cities)'],
    });
places = new google.maps.places.PlacesService(map);

autocomplete.addListener('place_changed', onPlaceChanged);

function initMap() {
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 15,
        center: startingLoc,
        panControl: false,
        zoomControl: true,
        streetViewControl: true,
        dragabble: true,
        gestureHandling: 'cooperative',
        styles: [
            {elementType: 'geometry', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.stroke', stylers: [{color: '#242f3e'}]},
            {elementType: 'labels.text.fill', stylers: [{color: '#746855'}]},
            {
              featureType: 'administrative.locality',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'geometry',
              stylers: [{color: '#263c3f'}]
            },
            {
              featureType: 'poi.park',
              elementType: 'labels.text.fill',
              stylers: [{color: '#6b9a76'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry',
              stylers: [{color: '#38414e'}]
            },
            {
              featureType: 'road',
              elementType: 'geometry.stroke',
              stylers: [{color: '#212a37'}]
            },
            {
              featureType: 'road',
              elementType: 'labels.text.fill',
              stylers: [{color: '#9ca5b3'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry',
              stylers: [{color: '#746855'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'geometry.stroke',
              stylers: [{color: '#1f2835'}]
            },
            {
              featureType: 'road.highway',
              elementType: 'labels.text.fill',
              stylers: [{color: '#f3d19c'}]
            },
            {
              featureType: 'transit',
              elementType: 'geometry',
              stylers: [{color: '#2f3948'}]
            },
            {
              featureType: 'transit.station',
              elementType: 'labels.text.fill',
              stylers: [{color: '#d59563'}]
            },
            {
              featureType: 'water',
              elementType: 'geometry',
              stylers: [{color: '#17263c'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.fill',
              stylers: [{color: '#515c6d'}]
            },
            {
              featureType: 'water',
              elementType: 'labels.text.stroke',
              stylers: [{color: '#17263c'}]
            }
          ]
    });

    infoWindow = new google.maps.InfoWindow({
        content: document.getElementById('info-content')
    });

    autocomplete = new google.maps.places.Autocomplete(
        (document.getElementById('autocomplete')), {
            types: ['(cities)']
        });
    places = new google.maps.places.PlacesService(map);

    autocomplete.addListener('place_changed', onPlaceChanged);
}

function onPlaceChanged() {
    let place = autocomplete.getPlace();
    if (place.geometry) {
        map.panTo(place.geometry.location);
        map.setZoom(15);
        search(option);
    } else {
        document.getElementById('autocomplete').placeholder = 'Find destination';
    }
}


function search(option) {
    clearResults();
    clearMarkers();
    console.log("option: ", option);
    let search = {
        bounds: map.getBounds(),
        types: [ (option) ]
    };

    console.log("search: ", search);

    places.nearbySearch(search, function (results, status) {

            for (let i = 0; i < results.length; i++) {
                let markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
                let markerIcon = MARKER_PATH + markerLetter + '.png';
                // Use marker animation to drop the icons incrementally on the map.
                markers[i] = new google.maps.Marker({
                    position: results[i].geometry.location,
                    animation: google.maps.Animation.DROP,
                    icon: markerIcon
                });

                markers[i].placeResult = results[i];
                google.maps.event.addListener(markers[i], 'click', showInfoWindow);
                setTimeout(dropMarker(i), i * 100);
                addResult(results[i], i);
            }
        }
    );
}

function clearMarkers() {
    for (let i = 0; i < markers.length; i++) {
        if (markers[i]) {
            markers[i].setMap(null);
        }
    }
    markers = [];
}

function dropMarker(i) {
    return function () {
        markers[i].setMap(map);
    };
}

function addResult(result, i) {
    let results = document.getElementById('results');
    let markerLetter = String.fromCharCode('A'.charCodeAt(0) + (i % 26));
    let markerIcon = MARKER_PATH + markerLetter + '.png';


    let tr = document.createElement('tr');
    tr.style.backgroundColor = (i % 2 === 0 ? '#17263c' : '#242f3e');
    tr.onclick = function () {
        google.maps.event.trigger(markers[i], 'click');
    };

    let iconTd = document.createElement('td');
    let nameTd = document.createElement('td');
    let icon = document.createElement('img');
    icon.src = markerIcon;
    icon.setAttribute('class', 'placeIcon');
    icon.setAttribute('className', 'placeIcon');
    let name = document.createTextNode(result.name);
    iconTd.appendChild(icon);
    nameTd.appendChild(name);
    tr.appendChild(iconTd);
    tr.appendChild(nameTd);
    results.appendChild(tr);
}

function clearResults() {
    let results = document.getElementById('results');
    while (results.childNodes[0]) {
        results.removeChild(results.childNodes[0]);
    }
}


function showInfoWindow() {
    let marker = this;
    places.getDetails({placeId: marker.placeResult.place_id},
        function (place, status) {
            if (status !== google.maps.places.PlacesServiceStatus.OK) {
                return;
            }
            infoWindow.open(map, marker);
            buildIWContent(place);
        });
}

function buildIWContent(place) {
    document.getElementById('iw-icon').innerHTML = '<img class="hotelIcon" ' +
        'src="' + place.icon + '"/>';
    document.getElementById('iw-url').innerHTML = '<b><a href="' + place.url +
        '">' + place.name + '</a></b>';
    document.getElementById('iw-address').textContent = place.vicinity;

    if (place.formatted_phone_number) {
        document.getElementById('iw-phone-row').style.display = '';
        document.getElementById('iw-phone').textContent =
            place.formatted_phone_number;
    } else {
        document.getElementById('iw-phone-row').style.display = 'none';
    }

    if (place.rating) {
        let ratingHtml = '';
        for (let i = 0; i < 5; i++) {
            if (place.rating < (i + 0.5)) {
                ratingHtml += '&#10025;';
            } else {
                ratingHtml += '&#10029;';
            }
            document.getElementById('iw-rating-row').style.display = '';
            document.getElementById('iw-rating').innerHTML = ratingHtml;
        }
    } else {
        document.getElementById('iw-rating-row').style.display = 'none';
    }


    if (place.website) {
        let fullUrl = place.website;
        let website = hostnameRegexp.exec(place.website);
        if (website === null) {
            website = 'http://' + place.website + '/';
            fullUrl = website;
        }
        document.getElementById('iw-website-row').style.display = '';
        document.getElementById('iw-website').textContent = website;
    } else {
        document.getElementById('iw-website-row').style.display = 'none';
    }
}
