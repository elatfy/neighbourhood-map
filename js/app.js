/* initial points of interestt list.*/
var points = [{
    name: 'Cortigiano Restaurant',
    lat: 29.9702629,
    lng: 31.2361899
}, {
    name: 'Abou El Sid Restaurant',
    lat: 29.9618234,
    lng: 31.2487641
}, {
    name: 'Crave',
    lat: 29.9617206,
    lng: 31.263055
}, {
    name: 'Mori Sushi',
    lat: 29.9594637,
    lng: 31.2598278
}, {
    name: 'Gandofly (seafood)',
    lat: 29.9701341,
    lng: 31.2670376,
}];
var map;
var fsClientID;
var fsClientSecret;
var fsBaseURL;
/**
 * This is the primary knockout view model and data for the app
 * and will be instantiated when Google Maps API Callback is called
 * 
 */
var mapDetectiveViewModel = function() {
    var self = this;
    this.currentLocation = ko.observable();
    this.locationsFilter = ko.observable('');
    this.locations = ko.observableArray([]);
    this.searchString = ko.observable("");
    fsClientID = "JWP42H21JUOYEUTC03DNOXQITCDAXDG4SMZTFIOL5I5VZRYC";
    fsClientSecret = "UBQUBQSNFQBXBD15L1GX1E5LSENRDQLPS4QVUAHAK1WICEG5";
    fsBaseURL = 'https://api.foursquare.com/v2/venues/search?ll=';
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 13,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        center: {
            lat: 29.9594637,
            lng: 31.2598278
        }
    });
    points.forEach(function(location) {
        self.locations.push(new point(location));
    });
    this.filteredList = ko.computed(function() {
        var filter = self.searchString().toLowerCase();
        if (!filter) {
            self.locations().forEach(function(location) {
                location.visible(true);
            });
            return self.locations();
        } else {
            return ko.utils.arrayFilter(self.locations(), function(location) {
                var string = location.name.toLowerCase();
                var result = (string.search(filter) >= 0);
                location.visible(result);
                return result;
            });
        }
    }, self);
};
/**
 * This is the class for instatiating points.  Points are locations and
 * include both map marker details, resource links, and Foursquare API Calls
 * @param  {object} point      [point from the locations of interest list]
 */
var point = function(point) {
    var self = this;
    this.name = point.name;
    this.fsname = '';
    this.lat = point.lat;
    this.lng = point.lng;
    this.URL = "";
    this.street = "";
    this.city = "";
    this.phone = "";
    this.visible = ko.observable(true);
    var fsURL = fsBaseURL + this.lat + ',' + this.lng + '&client_id=' + fsClientID + '&client_secret=' + fsClientSecret + '&v=20170813' + '&query=' + this.name;
    /**
     * gets foursquare  JSON data via AJAX Call based on a point
     */
    $.getJSON(fsURL).done(function(data) {
        var fsLocationData = data.response.venues[0];
        console.log(fsLocationData);
        if (typeof fsLocationData.name === 'undefined') {
            self.fsname = "";
        } else {
            self.fsname = fsLocationData.name;
        }
        if (typeof fsLocationData.url === 'undefined') {
            self.URL = "";
        } else {
            self.URL = fsLocationData.url;
        }
        if (typeof fsLocationData.location.formattedAddress[1] === 'undefined') {
            self.street = '';
        } else {
            self.street = fsLocationData.location.formattedAddress[1];
        }
        if (typeof fsLocationData.location.formattedAddress[0] === 'undefined') {
            self.city = '';
        } else {
            self.city = fsLocationData.location.formattedAddress[0];
        }
        if (typeof fsLocationData.contact.phone === 'undefined') {
            self.phone = "";
        } else {
            self.phone = fsLocationData.contact.phone;
        }
    }).fail(function() {
        alert("There was an error with the Foursquare API call.");
    });
    this.content = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" + '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" + '<div class="content">' + self.street + "</div>" + '<div class="content">' + self.city + "</div>" + '<div class="content">' + self.phone + "</div></div>";
    this.infoWindow = new google.maps.InfoWindow({
        content: self.content
    });
    this.marker = new google.maps.Marker({
        position: new google.maps.LatLng(point.lat, point.lng),
        map: map,
        title: point.name
    });
    this.showMarker = ko.computed(function() {
        if (this.visible() === true) {
            this.marker.setMap(map);
        } else {
            this.marker.setMap(null);
        }
        return true;
    }, this);
    this.marker.addListener('click', function() {
        self.content = '<div class="info-window-content"><div class="title"><b>' + self.name + "</b></div>" + '<div class="content"><a href="' + self.URL + '">' + self.URL + "</a></div>" + '<div class="content">' + self.street + "</div>" + '<div class="content">' + self.city + "</div>" + '<div class="content"><a href="tel:' + self.phone + '">' + self.phone + "</a></div></div>";
        self.infoWindow.setContent(self.content);
        self.infoWindow.open(map, this);
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {
            self.marker.setAnimation(null);
        }, 2100);
    });
    this.bounce = function(place) {
        google.maps.event.trigger(self.marker, 'click');
    };
};

function initApp() {
    ko.applyBindings(new mapDetectiveViewModel());
}

function error() {
    alert("Google Maps has failed to load. Please check your internet connection and try again.");
}