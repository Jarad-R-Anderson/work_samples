<?php
ini_set('display_errors',1);
$Token = '';

$sql = "
	SELECT 
		*, 
		TIMEDIFF(NOW(),gss_expiry) AS time_diff 
	FROM gps_settings 
";
$qry = nuRunQuery($sql);

if(db_num_rows($qry) == 0) {
		
	$Token = loginGPS();
	storeToken($Token);	
	
} else {

	$obj = db_fetch_object($qry);
	$time = explode(":",$obj->time_diff);
	
	if($time[0] >= 12) {	
	
		$Token = loginGPS();
		storeToken($Token);	
		
	} else {
		$Token = $obj->gss_token;
	}
	
}

echo 'Token: '.$Token;

$client = new SoapClient('https://api.fm-web.com.au/webservices/AssetDataWebSvc/DriverProcessesWS.asmx?WSDL');
$client->__setSoapHeaders(new SOAPHeader('http://www.omnibridge.com/SDKWebServices/AssetData', 'TokenHeader', array('Token' => $Token)));
$response = $client->GetDriverList();

$drivers = $response->GetDriverListResult->Driver;

echo '<pre>';
echo print_r($drivers,1);
echo '</pre>';

foreach($drivers as $driver) {

	$ID = $driver->ID;
	$name = str_replace("'","\'",$driver->Name);

	$sql = "
		UPDATE 
			driver 
		SET 
			dri_gps_id = '$ID' 
		WHERE 
			CONCAT(dri_first_name,' ',dri_last_name) = '$name' 
	";
	nuRunQuery($sql);
}

function loginGPS() {
	$client = new SoapClient('https://api.fm-web.com.au/webservices/CoreWebSvc/CoreWS.asmx?WSDL');
	$response = $client->Login(array('UserName' => 'sgelben', 'Password' => 'password01'));

	return $response->LoginResult->Token;
}

function storeToken($pToken) {
	
	$sql = "TRUNCATE TABLE gps_settings ";
	nuRunQuery($sql);

	$id = uniqid(1);
	
	$sql = "
		INSERT INTO gps_settings (
			gps_settings_id,
			gss_token,
			gss_expiry
		) VALUES (
			'$id',
			'$pToken',
			NOW()
		)
	";
	nuRunQuery($sql);
}
?>