<?php
//*******************************************************//
//*** Xero Connection Code to update Chart of Accounts **//
//*******************************************************//

//retrieve system setup values
$sql = "
	SELECT 
		* 
	FROM xero_settings 
";
$qry = nuRunQuery($sql);

if(db_num_rows($qry) > 0) {
	$obj = db_fetch_object($qry);
} else {
	die('Xero Settings could not be found');
}

$public_key = $obj->set_xero_public;
$private_key = $obj->set_xero_private;
$xero_key = $obj->set_xero_key;
$xero_secret = $obj->set_xero_secret;
$recieve_account = $obj->set_xero_recievable_ledger;
$payable_account = $obj->set_xero_payable_ledger;
$config_php = $obj->set_xero_config_php;

//load in Xero Core
$sql = "
	SELECT 
		slp_php 
	FROM zzzsys_php 
	WHERE 
		slp_code = 'XeroCore' 
";
$qry  = nuRunQuery($sql);

if(db_num_rows($qry) > 0) {
	$obj = db_fetch_object($qry);
} else {
	die('Xero Core PHP not found');
}

$code = $obj->slp_php;

try {
	eval($code);
} catch(Exception $e) {
	die('Error encountered running Xero Core '.$e->getMessage());
}

//include xero keys and class
//keys can be setup in xero and retreived via a command line executable
require_once($config_php);

define('XERO_KEY', $xero_key);
define('XERO_SECRET', $xero_secret);
$xero = new Xero(XERO_KEY, XERO_SECRET, $public_key, $private_key, 'xml' );

//get the chart of accounts from Xero
$coa_result = $xero->Accounts();
$coa_list = $coa_result->Accounts->Account;

foreach($coa_list AS $coa) {

	//loop through the chart of accounts
	$coa_xero_id = $coa->AccountID;
	$coa_code = $coa->Code;
	$coa_description = mysql_real_escape_string($coa->Name);
	$coa_status = $coa->Status;
	$coa_tax_type = $coa->TaxType;
	
	//tax rate if it has one
	$coa_tax_rate = 0;
	if($coa_tax_type == 'CAPEXINPUT' || $coa_tax_type == 'INPUT' || $coa_tax_type == 'OUTPUT') {
		$coa_tax_rate = 1;
	}
	
	$coa_class = $coa->Class;
	
	$sql = "
		SELECT 
			* 
		FROM chart_of_accounts 
		WHERE 
			coa_xero_id = '$coa_xero_id' 
	";
	$qry = nuRunQuery($sql);
	
	//check if it exists, if so update, if not insert
	if(db_num_rows($qry) > 0) {
	
		echo 'Updating Account '.$coa_code.'<br>';
		$sql = "
			UPDATE 
				chart_of_accounts 
			SET 
				coa_code = '$coa_code', 
				coa_description = '$coa_description', 
				coa_status = '$coa_status', 
				coa_tax_type = '$coa_tax_type', 
				coa_tax_rate = '$coa_tax_rate', 
				coa_class = '$coa_class' 
			WHERE 
				coa_xero_id = '$coa_xero_id' 
		";
		nuRunQuery($sql);
		
	} else {
	
		echo 'Adding Account '.$coa_code.'<br>';
		$nid = uniqid(1);
		
		$sql = "
			INSERT INTO chart_of_accounts VALUES (
				'$nid', 
				'$coa_code', 
				'$coa_description', 
				'$coa_status', 
				'$coa_tax_type', 
				'$coa_tax_rate', 
				'$coa_class', 
				'$coa_xero_id' 
			)
		";
		nuRunQuery($sql);
		
	}
}
?>