/// <reference path="../../../FrontEnd/GIS/GetJSON.aspx" />
import { inject, bindable, computedFrom } from 'aurelia-framework';
import { Router } from 'aurelia-router';
import { applicationState } from 'applicationState';
import numeral from 'numeral';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(applicationState, Router, EventAggregator)
export class listings {


  // ---------------------------------------------------------------------------------
  // Constructor
  // ---------------------------------------------------------------------------------

  constructor(appState, router, eventAggregator) {
    this.appState = appState;
    this.router = router;
    this.eventAggregator = eventAggregator;
    var self = this;
    this.firstTime = true;
  }



  // ---------------------------------------------------------------------------------
  // Class Variables
  // ---------------------------------------------------------------------------------

  listings = [];
  sortColumn = 'StatusHours';
  sortOrder = 'ascending';
  currentAddress = 'Seattle, WA';
  longitude = -122.349275;
  latitude = 47.620548;


  // ---------------------------------------------------------------------------------
  // Map Globals
  // --------------------------------------------------------------------------------- 

  // ---------------------------------------------------------------------------------
  // POIs
  // ---------------------------------------------------------------------------------

  POIs = [{ POIID: 0, POIName: 'None' }];


  // ---------------------------------------------------------------------------------
  // Filters
  // ---------------------------------------------------------------------------------

  filters = { Style: [], MinBeds: [0], MaxBeds: [0], MinSqft: [0], MaxSqft: [0], POIMaxDriveTime: [300], POI: [], MHA: [], MHA2: [], UV: [], FUV: [], DOM: [0], STATDAYS: [1], MinPrice: [0], MaxPrice: [100000000], MinLot: [0], MaxLot: [4000000], ListingStatus: ['A'], Zoning: [], Use: ['SF', 'MF', 'Vacant', 'C'] };



  @bindable mapMarkers = [

    {
      infoWindow: {
        content: `
                <div id="content">
                  <div id="siteNotice"></div>
                  <h1 id="firstHeading" class="firstHeading">Uluru</h1>
                  <div id="bodyContent">
                    <p><b>Uluru</b>, also referred to as <b>Ayers Rock</b>, is a large sandstone rock formation in the southern part of the Northern Territory, central Australia. It lies 335&#160;km (208&#160;mi) south west of the nearest large town, Alice Springs; 450&#160;km (280&#160;mi) by road. Kata Tjuta and Uluru are the two major features of the Uluru - Kata Tjuta National Park. Uluru is sacred to the Pitjantjatjara and Yankunytjatjara, the Aboriginal people of the area. It has many springs, waterholes, rock caves and ancient paintings. Uluru is listed as a World Heritage Site.</p>
                    <p>Attribution: Uluru, <a href="https://en.wikipedia.org/w/index.php?title=Uluru&oldid=297882194">https://en.wikipedia.org/w/index.php?title=Uluru</a> last visited June 22, 2009).</p>
                  </div>
                </div>`}
    }
  ];



  // ---------------------------------------------------------------------------------
  // Page Load Code
  // ---------------------------------------------------------------------------------

  attached() {
    var self = this;


    // Initialize Price Range Slider
    //$('[data-ui-slider]').slider();

    // Price Range Slider filter event
    $(document).ready(function () {
      $("#priceRangeSliderID").change(function () {
        var priceRange = $("#priceRangeSliderID").attr("value").split(",");
        var minPrice = priceRange[0];
        var maxPrice = priceRange[1];
        self.filters["MinPrice"][0] = minPrice;
        self.filters["MaxPrice"][0] = maxPrice;
        //console.log("4444");
        self.refreshData();
      });
    });

    // Lot Range Slider filter event
    $(document).ready(function () {
      $("#lotRangeSliderID").change(function () {
        var priceRange = $("#lotRangeSliderID").attr("value").split(",");
        var minLot = priceRange[0];
        var maxLot = priceRange[1];
        self.filters["MinLot"][0] = minLot;
        self.filters["MaxLot"][0] = maxLot;
        //console.log("3333");
        self.refreshData();
      });
    });

    // On Load Event
    this.appState.connectionReady.done(function () {
      self.refreshData();
      self.loadPOIs();
    });

    // Scroll Listings on Map Click
    this.eventAggregator.subscribe('googlemap:marker:click', response => {
      self.clickRow('', response["custom"]["id"], '');
      var dif = $("#listingsTableDiv").offset().top - $("#listingsTableID").offset().top + $("#listingsTableRow_" + response["custom"]["id"]).position().top - 18;
      $('#listingsTableDiv').animate({
        scrollTop: dif
      }, 400);
    });

    // Map Boudries filter event

    this.eventAggregator.subscribe('googlemap:bounds_changed', response => {
      //console.log(response);

      this.filters["Boundries"] = [response["f"]["f"], response["f"]["b"], response["b"]["f"], response["b"]["b"]];

      if (this.firstTime == true)
        this.loadMapLayers(this.GoogleMap);

      if (this.firstTime == false)
        this.refreshData();
      this.firstTime = false;


    });


    // Refresh Listings on server listings event 
    this.eventAggregator.subscribe('RealtorAnalytics:Listings:Updated', response => {
      console.log("eventAggregator: realtoranalytics:listings:updated");
      self.refreshData();
    });

    /*
    this.eventAggregator.subscribe('googlemap:api:loaded', () => {  
    });
    */
  }

  loadMapLayers(map) {
    this.zoningLayer = new google.maps.Data();
    this.uvLayer = new google.maps.Data();
    this.CurrentuvLayer = new google.maps.Data();
    this.zoningChangeLayer = new google.maps.Data();
    this.transitLayer = new google.maps.Data();
    this.zoningLayer.loadGeoJson("/Admin/GIS/Layers/Zoning/Seattle/2017-06-HALA-DEIS/MHA_Zoning_Alt3.json");
    //this.zoningLayer.loadGeoJson("/Admin/GIS/Layers/Zoning/Seattle/MHA_DraftZoningChanges.json");
    //zoningChangeLayer.loadGeoJson("/Admin/GIS/Layers/Zoning/Seattle/MHA_ZoningChangeType.json");
    this.uvLayer.loadGeoJson("/Admin/GIS/Layers/Overlays/Seattle/2017MHAUrbanVillages.json");
    this.CurrentuvLayer.loadGeoJson("/Admin/GIS/Layers/Overlays/Seattle/UrbanVillages.json");



    this.zoningLayer.setMap(this.GoogleMap.map);
    //zoningChangeLayer.setMap(this.GoogleMap.map);
    this.uvLayer.setMap(this.GoogleMap.map);
    this.CurrentuvLayer.setMap(this.GoogleMap.map);
    this.transitLayer.setMap(this.GoogleMap.map);


    this.uvLayer.setStyle(function (feature) {
      var uvtype = feature.getProperty('UV_TYPE');
      var _color;
      var _fillOpacity;
      var _strokeColor;
      var _strokeWeight;
      var firstChar;
      if (uvtype.strlength == 0)
        firstChar = "";
      else
        firstChar = uvtype.substring(0, 1);
      if (firstChar == "F") {
        _color = '#111111';
        _fillOpacity = 0.00;
        _strokeColor = '#FF9900';
        _strokeWeight = '2'
      }
      else {
        _color = ((uvtype == "UC") || (uvtype == "UCV")) ? '#111111' : '#333333';
        _fillOpacity = 0;
        _strokeColor = '#222222';
        _strokeWeight = '2'
      }
      return {
        fillColor: _color,
        fillOpacity: _fillOpacity,
        strokeColor: _strokeColor,
        strokeOpacity: '1',
        strokeWeight: _strokeWeight,
        zIndex: 9,
        clickable: false
      };
    });


    this.transitLayer.setStyle(function (feature) {
      var shapeTime = feature.getProperty('RE_NAME');
      var _color;
      var _fillOpacity = 0.2;
      var _strokeColor;
      var _strokeWeight;
      var firstChar;

      if (shapeTime == 300)
        _color = '#018812';
      else if (shapeTime == 600)
        _color = '#01CC32';
      else if (shapeTime == 900)
        _color = '#FF9900';
      return {
        fillColor: _color,
        fillOpacity: _fillOpacity,
        strokeColor: _strokeColor,
        strokeOpacity: '0',
        strokeWeight: _strokeWeight,
        zIndex: 1,
        clickable: false
      };
    });


    this.CurrentuvLayer.setStyle(function (feature) {
      var uvtype = feature.getProperty('UV_TYPE');
      var _color;
      var _fillOpacity;
      var _strokeColor;
      var _strokeWeight;
      _color = ((uvtype == "UC") || (uvtype == "UCV")) ? '#111111' : '#333333';
      _fillOpacity = 0.00;
      _strokeColor = '#aaaaaa';
      _strokeWeight = '2'
      return {
        fillColor: _color,
        fillOpacity: _fillOpacity,
        strokeColor: _strokeColor,
        strokeOpacity: '1',
        strokeWeight: _strokeWeight,
        zIndex: 10,
        clickable: false
      };
    });
    /*
    zoningChangeLayer.setStyle(function (feature) {
                
        var Zone = feature.getProperty('MHA_ZONING').toUpperCase();
        var _color;
        var _fillOpacity;
        var _strokeColor;
        var _strokeWeight;
        var _strokeOpacity;

        _color = '#000000';
        _fillOpacity = 0.15;
        _strokeColor = '#000000';
        _strokeWeight = '0'
        _strokeOpacity = 0;

        if (Zone == "RSL (M)") {
                    
            _fillOpacity = 0.00;
            _strokeColor = '#0000FF';
            _strokeWeight = '0'
            _strokeOpacity = 0;
        }
                


        return {
            fillColor: _color,
            fillOpacity: _fillOpacity,
            strokeColor: _strokeColor,
            strokeOpacity: '0.5',
            strokeWeight: _strokeWeight,
            zIndex: 12,
            clickable:false
        };
    });
    */


    this.zoningLayer.setStyle(function (feature) {

      var objectID = feature.getProperty('ZONEID');
      var Zone = feature.getProperty('MHA_ZONING').toUpperCase();
      var ZoneDesc = feature.getProperty('ZONELUT_DE');
      var isMHA = feature.getProperty('MHA');
      var isUpgrade = feature.getProperty('UPGRADE');

      var _color;
      var _fillOpacity;
      var _strokeColor;
      var _strokeWeight;
      var _strokeOpacity;

      _color = '#FFFFFF';
      _fillOpacity = 0.25;
      _strokeWeight = 0.5;
      _strokeOpacity = 0.1;

      if (Zone.indexOf("SF") >= 0) {
        _color = '#ffffff';
        _fillOpacity = 0.1;
      } else if (Zone.indexOf("RSL") >= 0) {
        _color = '#fffb9a';
      } else if (Zone.indexOf("LR1") >= 0) {
        _color = '#fff14a';
      } else if (Zone.indexOf("LR2") >= 0) {
        _color = '#fcc02c';
      } else if (Zone.indexOf("LR3") >= 0) {
        _color = '#f67f17';

      } else if ((Zone.indexOf("MR") >= 0) || (Zone.indexOf("HR") >= 0)) {
        _color = '#f36f11';
      } else if ((Zone.indexOf("NC1") >= 0) || (Zone.indexOf("NC2") >= 0) || (Zone.indexOf("NC3") >= 0)) {
        if ((Zone.indexOf("30") >= 0))
          _color = "#c261da";
        else if ((Zone.indexOf("40") >= 0))
          _color = "#c261da";
        else if ((Zone.indexOf("55") >= 0))
          _color = "#b450cd";
        else if ((Zone.indexOf("65") >= 0))
          _color = "#a03aba";
        else if ((Zone.indexOf("75") >= 0))
          _color = "#9530ae";
        else if ((Zone.indexOf("85") >= 0))
          _color = "#8b27a4";
        else if ((Zone.indexOf("95") >= 0))
          _color = "#822699";
        else if ((Zone.indexOf("125") >= 0) || (Zone.indexOf("160") >= 0))
          _color = "#641a76";
        else
          _color = "#a03aba";
      } else if ((Zone.indexOf("SM") >= 0) || (Zone.indexOf("SM") >= 0) || (Zone.indexOf("SM") >= 0)) {
        _color = '#7b41cc';
      } else if ((Zone.indexOf("DMC") >= 0) || (Zone.indexOf("DRC") >= 0) || (Zone.indexOf("PMM") >= 0)) {
        _color = '#42329c';
      } else if ((Zone.indexOf("C1") >= 0) || (Zone.indexOf("C2") >= 0) || (Zone.indexOf("C3") >= 0)) {
        _color = '#28b6f6';
      } else if ((Zone.indexOf("IB") >= 0) || (Zone.indexOf("IG") >= 0) || (Zone.indexOf("IC") >= 0)) {
        _color = '#aaaadd';
        _fillOpacity = 0.06;
      }

      _strokeColor = _color;


      if (isMHA == "1") {

        _fillOpacity = 0.6;

      }


      return {
        fillColor: _color,
        fillOpacity: _fillOpacity,
        strokeColor: _strokeColor,
        strokeOpacity: _strokeOpacity,
        strokeWeight: _strokeWeight,
        zIndex: 3
        //clickable: false
      };
    });






  }

  hyperLink(url) {
    window.open(url);
  }

  // ---------------------------------------------------------------------------------
  // Filter click events
  // ---------------------------------------------------------------------------------

  clickCheckbox(group, value, chkbox) {

    if (!$("#" + chkbox).prop("checked"))
      this.filters[group].push(value)
    else
      this.filters[group].splice(this.filters[group].indexOf(value), 1);

    this.refreshData();


  }

  clickRadio(group, value, chkbox) {
    this.filters[group] = [value];
    this.refreshData();
  }


  loadPOIs() {
    var self = this;
    //console.log(this.filters);
    this.appState.listingsHub.invoke('GetPOIs').done(function (data) {
      //console.log('Finished calling GetListings, result size was ', data.length);
      self.POIs = JSON.parse(data);
    }).fail(function (data) {
      console.log('Failed calling GetPOIs');
    });
  }

  refreshData() {
    var self = this;
    console.log(this.filters);
    this.appState.listingsHub.invoke('GetListings', this.filters).done(function (data) {
      console.log('Finished calling GetListings, result size was ', data.length);
      self.listings = JSON.parse(data);
      //console.log(data);
      var haveNeighbourhood = true;
      var haveSNeighbourhood = true;
      for (var i = 0; i < self.listings.length; i++) {

        if (self.listings[i]["PrimaryImage"].length > 0) {
          self.listings[i]["PrimaryImage"] = "http://www.realtoranalytics.com/ImgSrv/Listings/" + self.listings[i]["MLSNumber"].substring(self.listings[i]["MLSNumber"].length - 2) + "/" + self.listings[i]["MLSNumber"] + "/" + self.listings[i]["PrimaryImage"]
        }
        else {
          self.listings[i]["PrimaryImage"] = "http://www.realtoranalytics.com/ImgSrv/Listings/00.png";
        }
        if (numeral(self.listings[i]["FrequentTransitScanned"]) > 0)
          self.listings[i]["FrequentTransitCSS"] = "";
        else
          self.listings[i]["FrequentTransitCSS"] = "DISPLAYNONE";

        // Price for Sold Properties
        if (self.listings[i]["ST"] == "S")
          self.listings[i]["ListingPrice"] = self.listings[i]["SellingPrice"];


        if ((self.listings[i]["UrbanVillageCurrent"] == "") || (self.listings[i]["UrbanVillageCurrent"] == "N/A") || (self.listings[i]["City"] != "Seattle"))
          self.listings[i]["UrbanVillageCSS"] = "DISPLAYNONE";
        else
          self.listings[i]["UrbanVillageCSS"] = "";

        if (("N/A" == self.listings[i]["ZoningFuture"]) || ("" == self.listings[i]["ZoningFuture"]))
          self.listings[i]["ZoningFutureCSS"] = "DISPLAYNONE";
        else
          self.listings[i]["ZoningFutureCSS"] = "";

        if ((self.listings[i]["UrbanVillageFuture"] == "N/A") || (self.listings[i]["UrbanVillageFuture"] == "") || (self.listings[i]["UrbanVillageCurrent"] == self.listings[i]["UrbanVillageFuture"]))
          self.listings[i]["UrbanVillageFutureCSS"] = "DISPLAYNONE";
        else
          self.listings[i]["UrbanVillageFutureCSS"] = "";
        if ((self.listings[i]["Neighbourhood"] == "N/A") || (self.listings[i]["Neighbourhood"] == "NO BROADER TERM") || (self.listings[i]["Neighbourhood"] == "") || (self.listings[i]["Neighbourhood"] == self.listings[i]["SNeighbourhood"]))
          haveNeighbourhood = false;
        else {
          var haveNeighbourhood = true;
          self.listings[i]["Neighbourhood"] = self.titleCase(self.listings[i]["Neighbourhood"]);
        }
        if ((self.listings[i]["SNeighbourhood"] == "N/A") || (self.listings[i]["SNeighbourhood"] == "NO BROADER TERM") || (self.listings[i]["Neighbourhood"] == ""))
          haveSNeighbourhood = false;
        else {
          var haveSNeighbourhood = true;
          self.listings[i]["SNeighbourhood"] = self.titleCase(self.listings[i]["SNeighbourhood"]);
        }
        if ((self.listings[i]["PresentUseGroup"] != "MF") || (self.listings[i]["CAP"] == "0.00") || (self.listings[i]["CAP"] == ""))
          self.listings[i]["CAPTEXT"] = "";
        else {
          self.listings[i]["CAPTEXT"] = "CAP " + self.listings[i]["CAP"] + "%";
        }


        if (haveNeighbourhood && haveSNeighbourhood)
          self.listings[i]["NeighbourhoodUnited"] = self.listings[i]["Neighbourhood"] + " / " + self.listings[i]["SNeighbourhood"];
        else if (haveNeighbourhood)
          self.listings[i]["NeighbourhoodUnited"] = self.listings[i]["Neighbourhood"];
        else if (haveSNeighbourhood)
          self.listings[i]["NeighbourhoodUnited"] = self.listings[i]["SNeighbourhood"];
        else
          self.listings[i]["NeighbourhoodUnited"] = "";
        //self.listings[i]["NeighbourhoodUnited"] = camelize(self.listings[i]["NeighbourhoodUnited"]);
        if (self.listings[i]["NeighbourhoodUnited"].length > 32)
          self.listings[i]["NeighbourhoodUnited"] = self.listings[i]["NeighbourhoodUnited"].substring(0, 32) + "...";

      }
      self.mapMarkers = self.createMarkers(self.listings);

    }).fail(function (data) {
      console.log('Failed calling GetListings');
    });
  }


  // ---------------------------------------------------------------------------------
  // Map click event
  // ---------------------------------------------------------------------------------

  onClickMap(event) {
    /*var latLng = event.detail.latLng,
        lat = latLng.lat(),
        lng = latLng.lng();

    console.log(event);
    console.log(lat+':'+lng);
    */
  }



  titleCase(str) {
    str = str.replace("/", " ");
    str = str.replace("//", " ");
    str = str.replace("\/", " ");
    str = str.replace("  ", " ");
    str = str.replace("  ", " ");
    var words = str.toLowerCase().split(' ');
    for (var i = 0; i < words.length; i++) {
      var letters = words[i].split('');
      letters[0] = letters[0].toUpperCase();
      words[i] = letters.join('');
    }
    return words.join(' ');
  }


  changePriceRange(event) {
    //console.log('A');
    //console.log(this.filters.MinPrice[0]);
  }

  changeLotRange(event) {
    //console.log('A');
    //console.log(this.filters.MinPrice[0]);
  }


  createMarkers(listingsArray) {
    var markersArray = [];
    for (var i in listingsArray) {
      var markerTitle = "";
      if (isNaN(listingsArray[i]["ListingPrice"])) {
        markerTitle = listingsArray[i]["FullAddress"]
      }
      else {
        markerTitle = listingsArray[i]["FullAddress"] + ' ' + numeral(listingsArray[i]["ListingPrice"]).format('($0,0)');
      }

      var iconimg = 'img/Markers/' + listingsArray[i]["ListingStatus"] + '/'
      if (listingsArray[i]["PresentUseGroup"] != "")
        iconimg = iconimg + listingsArray[i]["PresentUseGroup"] + ".png";
      else
        iconimg = iconimg + "null.png";

      //var iconimg = 'img/Markers/'+listingsArray[i]["ListingStatus"]+'/'+listingsArray[i]["PresentUseGroup"]+".png";
      iconimg = 'img/Markers/Temp/Marker' + listingsArray[i]["ListingStatus"] + '.png'
      //iconimg = 'img/Markers/Temp/b1g4.png'

      var _fontWeight = "normal";
      var _fontSize = "12px";
      var _fontcolor = "#555555";

      if (this.currentSelectedId == listingsArray[i]["ListingID"]) {
        _fontWeight = "bold";
        _fontSize = "12px";
        _fontcolor = "#000000";
      }

      var row = {
        custom: { id: listingsArray[i]["ListingID"] }, icon: iconimg, title: markerTitle, label: {
          text: this.formatKMB(listingsArray[i]["ListingPrice"]),
          color: _fontcolor,
          fontSize: _fontSize,
          fontWeight: _fontWeight
        }, longitude: listingsArray[i]["Longitude"], latitude: listingsArray[i]["Latitude"]
      };
      row.infoWindowx = {
        content: `
                <div id="content">    

                   <img src="`+ listingsArray[i]["ListingImage"] + `" width="240">
                     <br>
                    <a href="../REPM/PropertySearch.aspx?Address=`+ listingsArray[i]["FullAddress"] + `" target="_ps">` + listingsArray[i]["FullAddress"] + `</a>
                      <a href="`+ listingsArray[i]["URL"] + `" target="_rf"><h3 id="firstHeading" class="firstHeading">` + numeral(listingsArray[i]["ListingPrice"]).format("$(0,0)") + `</h3></a>


                     <h5 id="secondHeading" class="firstHeading">`+ listingsArray[i]["ListingBeds"] + `<small>Bed</small> | ` + listingsArray[i]["ListingBaths"] + `<small>Bath</small> | ` + listingsArray[i]["ListingSqft"] + `<small>sf</small> | ` + listingsArray[i]["SqFtLot"] + `<small>sf</small> ` + listingsArray[i]["CurrentZoning"] + `` + `</h1>
 
                    <div id="textcontent" class="col-sm-12">
                      

                  </div>
                </div>`};

      markersArray.push(row);

    }
    //console.log(markersArray);
    return markersArray;
  }

  // ---------------------------------------------------------------------------------
  // Row click event
  // ---------------------------------------------------------------------------------

  clickRow(event, id, address, _longitude, _latitude) {
    this.currentSelectedId = id;
    $(".listingsTableRow").removeClass("info");
    $("#listingsTableRow_" + id).addClass("info");
    this.currentAddress = address;
    this.longitude = _longitude;
    this.latitude = _latitude;
    this.mapMarkers = this.createMarkers(this.listings);
    //console.log(this.mapMarkers[this.lookupIndexById(this.mapMarkers,id)].icon);
    //this.mapMarkers[this.lookupIndexById(this.mapMarkers,id)].icon+="XX";
    //this.mapMarkers.splice(this.lookupIndexById(this.mapMarkers,id),1);
  }

  // ---------------------------------------------------------------------------------
  // Sort event
  // ---------------------------------------------------------------------------------
  changeSort(sortByColumn) {
    if (sortByColumn == this.sortColumn) {
      if (this.sortOrder == 'ascending')
        this.sortOrder = 'descending'
      else
        this.sortOrder = 'ascending';
    }
    else
      this.sortOrder = 'ascending';
    this.sortColumn = sortByColumn;
  }

  // ---------------------------------------------------------------------------------
  // POI Change event
  // ---------------------------------------------------------------------------------
  POIchanged() {
    this.filters['POI'] = [];
    var poiid = $('select[name=POIsSelect]').val();
    //console.log(poiid);

    var maxTime = $('select[name=POIsMaxTime]').val();
    var _map = this.GoogleMap.map;

    for (var i = 0; i < poiid.length; i++)
      this.filters['POI'].push(poiid[i]);

    var self = this;
    //this.filters['POI']=[poiid];
    this.filters['POIMaxDriveTime'] = [maxTime];

    if ((poiid == "") || (poiid.length == 0) || (poiid[0] == "")) {
      //console.log("no poiid");
      this.refreshData();
      self.transitLayer.forEach(function (feature) {
        self.transitLayer.remove(feature);
      });
      this.zoningLayer.setMap(this.GoogleMap.map);
      this.uvLayer.setMap(this.GoogleMap.map);
      this.CurrentuvLayer.setMap(this.GoogleMap.map);
      this.transitLayer.setMap(null);
    } else {


      this.zoningLayer.setMap(null);
      this.uvLayer.setMap(null);
      this.CurrentuvLayer.setMap(null);
      this.transitLayer.setMap(this.GoogleMap.map);
      self.transitLayer.forEach(function (feature) {
        self.transitLayer.remove(feature);
      });
      var iCounter = 0;
      var iMax = poiid.length - 1;
      for (var i = 0; i <= iMax; i++) {
        var url = "/FrontEnd/GIS/GetJSON.aspx?poiID=" + poiid[i] + "&poiTransitType=car&poiMaxValue=" + maxTime
        //console.log(url);

        var promise = $.getJSON(url); //same as map.data.loadGeoJson();
        promise.then(function (data) {
          //console.log(data);

          self.transitLayer.addGeoJson(data);


          if (iCounter == iMax) {
            var bounds = new google.maps.LatLngBounds();
            self.transitLayer.forEach(function (feature) {
              feature.getGeometry().forEachLatLng(function (latlng) {
                bounds.extend(latlng);
              });
            });
            console.log(bounds);
            self.GoogleMap.map.fitBounds(bounds);
          }
          iCounter++;
        });
      }
      /*
     
      */

    }
  }

  lookupIndexById(markerArray, Id) {
    for (var row = 0; row < markerArray.length; row++) {

      if (markerArray[row].custom.id == Id) {
        return row;
      }
    }
    return -1;
  }

  formatKMB(value) {
    var str = "";
    var num = Number(value);
    var numlength = ("" + num).length;

    if (num >= 1000000) {
      var n1 = Math.round(num / Math.pow(10, numlength - 3));
      var d1 = n1 / Math.pow(10, 9 - numlength);
      str = (d1 + "M");
    }
    else
      if (num >= 1000) {
        var n1 = Math.round(num / Math.pow(10, numlength - 3));
        var d1 = n1 / Math.pow(10, 6 - numlength);
        str = (d1 + "K");
      }
      else
        str = num;
    return ("$" + str);
  }
}