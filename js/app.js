var locations = [
    {
        title: 'Tamimi Markets 160',
        location: {
            lat: 24.790830,
            lng: 46.649068
        },
        foursquare_id: "52a8c3b311d2af9ade8e19f5",
    },
    {
        title: 'SPAR Supermarket',
        location: {
            lat: 24.822850,
            lng: 46.650550
        },
        foursquare_id: "592bfd82c4df1d785e687f43",
    },
    {
        title: 'Tamimi Markets',
        location: {
            lat: 24.801743,
            lng: 46.673728
        },
        foursquare_id: "552e92d0498e8a85c347c0cb",
    },
    {
        title: 'Panda',
        location: {
            lat: 24.798200,
            lng: 46.642343
        },
        foursquare_id: "4ef8b2e77ee5bf7994968b7b",
    },
    {
        title: 'Alia Plaza',
        location: {
            lat: 24.808724,
            lng: 46.669085
        },
        foursquare_id: "532da41b498e05c8e7e41ba3",
    },
    {
        title: 'Danube Hypermarket',
        location: {
            lat: 24.808322,
            lng: 46.616368
        },
        foursquare_id: "54d9b9fa498ea38f91e08406",
    },
    {
        title: 'Farm Superstores',
        location: {
            lat: 24.811479,
            lng: 46.645696
        },
        foursquare_id: "549da700498ed7b6f83bb652",
    },
    {
        title: 'AlOthaim Markets',
        location: {
            lat: 24.814124,
            lng: 46.658897
        },
        foursquare_id: "5a074345805e3f5ff04ccdea"

    }

];

// array for the Map Styles, credit --> https://snazzymaps.com/style/30/cobalt
var styles = [
    {
        "featureType": "all",
        "elementType": "all",
        "stylers": [
            {
                "invert_lightness": true
            },
            {
                "saturation": 10
            },
            {
                "lightness": 30
            },
            {
                "gamma": 0.5
            },
            {
                "hue": "#435158"
            }
        ]
    }
];


// ====== Global Variables ====//
var map;
// changing default marker icon, credit --> https://developers.google.com/maps/documentation/javascript/markers
var markerImg = 'https://maps.google.com/mapfiles/kml/pal3/icon18.png';
// === Foursquare Auth === //
var clientId = 'QAWVY5MFH2EEGZP41M2OLKRZLD41P00GAW5YRADTWIL2S40A';
var clientSecret = 'PAU51QPZKTVC5U0HRKNANKVWBHEP1XM2ZXLXEQ340YTPXJ5F';




// ========================================================================================================//

function initMap() {

    map = new google.maps.Map(document.getElementById('map'), {
        center: {
            lat: 24.803182,
            lng: 46.632838
        },
        zoom: 13,
        styles: styles,
        mapTypeControl: false
    });

    // apply binding here to resolve 'google is not defined' issue I had.
    ko.applyBindings(new ViewModel());

}

function mapError() {
    $('#map').html(' <img class="error-msg" src="https://www.startupdonut.co.uk/sites/default/files/tax//oops_249x189.png" alt="Error img">   <h3 class="error-msg">Failed Loading GoogleMaps, Please Try again</h3> ');
    $('.search').toggleClass("hide");
}


// this function for animated Menu Icon, credit --> https://www.w3schools.com/howto/tryit.asp?filename=tryhow_css_menu_icon_js
function animateIcon(x) {
    x.classList.toggle("change");
}

// when hamburgerButton clicked, toggle hide class to search div.
$('.hamburgerButton').on('click', function () {
    $('.search').toggleClass("hide");
});


// credit --> WindowShopping project from GoogleMaps API Lesson
function fillInfoWindow(marker, infoWindow, content) {

    if (infoWindow !== marker) {
        infoWindow.marker = marker;
        infoWindow.setContent(content); // FOURSQUARE's CONTENT
        infoWindow.open(map, marker);
    }

    // call a function that make marker bounce temporarily, then center the map to it.
    toggleBounce(marker);
    map.setCenter(marker.getPosition());
}

//  credit --> https://developers.google.com/maps/documentation/javascript/examples/marker-animations#try-it-yourself
function toggleBounce(marker) {
    clearAnimation = function () {
        marker.setAnimation(null);
    };

    if (marker.getAnimation() !== null) {
        clearAnimation;
    } else {
        marker.setAnimation(google.maps.Animation.BOUNCE);
        // to make this function work temporarily, credit --> https://stackoverflow.com/a/10390193
        setTimeout(clearAnimation, 1400);
    }
}

/*
 * Setting up a function that should have all the variables 'observables' needed to mainpulate/store each location data
 * and Exploiting the Knockout features.  credit --> Using an Orginazation Library Lesson 'last part'
 */

function Supermarkets(data) {
    this.title = ko.observable(data.title);
    this.foursquare_id = ko.observable(data.foursquare_id);
    this.location = ko.observable(data.location);
    // variables to place API data to 
    this.photo = ko.observable();
    this.rating = ko.observable();
    this.likes = ko.observable();
    this.url = ko.observable();
    this.address = ko.observable();
    this.content = ko.observable();
    // and a marker variable
    this.marker = ko.observable();

    // trigger visibilty of a marker when clicked from Menu
    this.showClicked = function (store) {
        google.maps.event.trigger(this.marker, "click");
    };

}


function ViewModel() {

    // 'self' variable to access outer this -ViewModel- in nested functions.
    var self = this;
    // observable array to store locations[] data into.
    self.list = ko.observableArray([]);

    // another list to handle search results
    self.filterdList = ko.observableArray([]);

    var popUpInfoWindow = new google.maps.InfoWindow();

    // fill 'list' observable array with our locations[] data as 'Supermarket' objects.
    locations.forEach(function (store) {
        self.list.push(new Supermarkets(store));
    });

    // looping over each supermarket instance to perform needed functionalities.
    self.list().forEach(function (store) {

        // make a call to FOURSQUARE API, credit --> https://developer.foursquare.com/docs/api/venues/details
        $.ajax({
            url: 'https://api.foursquare.com/v2/venues/' + store.foursquare_id() + '?&client_id=' + clientId + '&client_secret=' + clientSecret + '&v=20180214',
            dataType: "json",
            success: function (data) {
                var venue = data.response.venue;
                // get the PRECIOUS data from the API
                var venueLikes = venue.likes.count;
                var venuShortUrl = venue.shortUrl;
                var venuePhoto = venue.bestPhoto.prefix + "100x100" + venue.bestPhoto.suffix;
                var venueRating = venue.rating;
                var venueAddress = venue.location.address + ", " + venue.location.city;

                // Assign it to our observables
                store.likes(venueLikes);
                store.url(venuShortUrl);
                store.photo(venuePhoto);
                store.rating(venueRating);
                store.address(venueAddress);

                // https://developers.google.com/maps/documentation/javascript/examples/infowindow-simple
                var contentHTML = '   <div><img src="http://www.boulangerieguay.ca/uploads/images/foursquare-boulangerie-guay.png" alt="Foursquare logo"><h2>' + store.title() + '</h2><p>' + store.address() + '</p><img src="' + store.photo() + '" alt="Supermarket Photo"><hr><p>ratings: ' + store.rating() + '</p><p>likes: ' + store.likes() + '</p><a href="' + store.url() + '">Click to Visit Supermarket Page</a></div>   ';

                // assign the content to Supermarket's content observable
                store.content(contentHTML);
            },

            error: function (e) {
                // when API data not available, set the content to an error message
                contentHTML = ' <img src="https://www.startupdonut.co.uk/sites/default/files/tax//oops_249x189.png" alt="Error img">   <h3>Failed getting Data from Foursquare, Please Try again</h3>';
                store.content(contentHTML);
            }

        }); // end ajax 


        // create markers for each instance
        var marker = new google.maps.Marker({
            map: map,
            position: store.location(),
            icon: markerImg,
            animation: google.maps.Animation.DROP
        });
        // add the marker to our Supermarket instance
        store.marker = marker;
        marker.addListener('click', function () {
            fillInfoWindow(this, popUpInfoWindow, store.content());
        });

        // populate the filteredList since by default there's no filter query
        self.filterdList.push(store);

    }); // end loop


    // userInput in search bar
    self.searchQuery = ko.observable('');

    /* This function will handle the search filteration. 'filteredList' have all locations originally, when user search for a place, we'll 
     * clear 'filteredList' and re-add stores based on search. Also manage marker Visibility.
     * credit --> https://opensoul.org/2011/06/23/live-search-with-knockoutjs/
     * credit --> https://stackoverflow.com/questions/34584181/create-live-search-with-knockout
     */
    self.filterStores = function () {
        self.filterdList.removeAll();
        var q = self.searchQuery().toLowerCase();

        self.list().forEach(function (store) {
            store.marker.setVisible(true);

            if (store.title().toLowerCase().indexOf(q) !== -1) {
                self.filterdList.push(store);
            }
        });

        self.filterdList().forEach(function (store) {
            store.marker.setVisible(true);
        });

    };

} // End VM
