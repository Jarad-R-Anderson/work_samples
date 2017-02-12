$truck = '';
if(isset($_GET['truck'])) {
	$truck = $_GET['truck'];
}

?>

<!DOCTYPE html>
<html>
  <head>

    <title>Rice Trip Map</title>
    <script src="https://maps.googleapis.com/maps/api/js?v=3.exp&sensor=false&libraries=places"></script>
	<script src="jquery/jquery-1.8.3.js" type='text/javascript'></script>

    <style>
		body {
			font-family: sans-serif;
			font-size: 14px;
		}
		#map_canvas {
			height: 642px;
			width: 945px;
		}
	</style>

	<script>
		var truckMarkers = new Array();
	
		var map = null;
		var geocode = null;
		
		var truckIdle = new google.maps.MarkerImage(
			'images/truckImages/truckIdle.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckN = new google.maps.MarkerImage(
			'images/truckImages/truckN.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckNE = new google.maps.MarkerImage(
			'images/truckImages/truckNE.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckE = new google.maps.MarkerImage(
			'images/truckImages/truckE.png',
			new google.maps.Size(62,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckSE = new google.maps.MarkerImage(
			'images/truckImages/truckSE.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckS = new google.maps.MarkerImage(
			'images/truckImages/truckS.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckSW = new google.maps.MarkerImage(
			'images/truckImages/truckSW.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckW = new google.maps.MarkerImage(
			'images/truckImages/truckW.png',
			new google.maps.Size(62,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		
		var truckNW = new google.maps.MarkerImage(
			'images/truckImages/truckNW.png',
			new google.maps.Size(50,50),
			new google.maps.Point(0,0),
			new google.maps.Point(25,50)
		);
		

		function initialize() {

			var mapOptions = {
				center: new google.maps.LatLng(-35.5888, 143.2195),
				zoom: 8,
				mapTypeId: google.maps.MapTypeId.ROADMAP
			};
			
			map = new google.maps.Map(document.getElementById('map_canvas'), mapOptions);

			geocoder = new google.maps.Geocoder();
			
			findMarkers();
      }
	  
	function findMarkers() {

		var url = 'nucall.php?p=getTruckLatLng&<?
			if(isset($_GET['truck'])) {
				echo "truck=".$truck;
			} else {
				echo "order=".'#RECORD_ID#';
			}
		?>';
		var response = $.ajax({
		  url:  url,
		  context: document.body,
		  async: false
		}).responseText;

		if(response == '') {
			//alert('No Trucks Found for Map');
		} else {
			var trucks = response.split(";");
			var ticon = '';

			for(var i = 0; i < trucks.length; i++){
				var truck = trucks[i].split(":");

				var cusLat = truck[0];
				var cusLng = truck[1];
				var speed = truck[2];
				var heading = truck[3];
				var tname = truck[4];

				if(heading == 0) {
					ticon = truckIdle;
				}else if(heading > 337 || heading <= 22) {
					ticon = truckN;
				} else if(heading > 22 && heading <= 67) {
					ticon = truckNE;
				} else if(heading > 67 && heading <= 112) {
					ticon = truckE;
				} else if(heading > 112 && heading <= 157) {
					ticon = truckSE;
				} else if(heading > 157 && heading <= 202) {
					ticon = truckS;
				} else if(heading > 202 && heading <= 247) {
					ticon = truckSW;
				} else if(heading > 247 && heading <= 292) {
					ticon = truckW;
				} else if(heading > 292 && heading <= 337) {
					ticon = truckNW;
				}
				
				truckMarkers[i] = new google.maps.Marker({      
					position: new google.maps.LatLng(cusLat,cusLng),      
					map: map,
					title: 'Rego: ' + tname + '    Speed: '+ speed +'km/h',
					animation: google.maps.Animation.DROP,
					icon: ticon,
				});

				//setupMarkerListener(truckMarkers[i]);
				
				truckMarkers[i].setMap(map);
			}
			
			map.setCenter(new google.maps.LatLng(cusLat,cusLng));
		}
					
		function setupMarkerListener(marker,coord) {
			google.maps.event.addListener(marker, 'click', function() {    
				 //var URL = "https://secure.nubuilder.com/build-521/form.php?x=1&f=14fd7efad7a1a5&r="+ customerID + "&dir=db/iranda&fly=&ses=" + parent.document.getElementById('session_id').value;
				 //window.open(URL,'Customer');
			});
		}
	 }
	  
     google.maps.event.addDomListener(window, 'load', initialize);
	  
	</script>
	</head>
	<body>
		<div id="map_canvas"></div>
	</body>
</html>

<?