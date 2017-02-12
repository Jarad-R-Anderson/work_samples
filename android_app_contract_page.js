/*
    IMPORTANT!
    Make sure all your custom javascript functions for each page are unique!
    Do not use $('#myinputid'), use $('input[id="myinputid"]') instead as jquery mobile has some issues
    Whenever updating a select dropdown, run $('select[id="myDropdown"]').selectmenu('refresh');
    Whenever updating a checkbox / radio, run $('input[type="radio"][id="myRadio"]').checkboxradio('refresh');
    or $('input[type="checkbox"][id="myCB"]').checkboxradio('refresh');
 */

var globalContractArray;
var currentSelectedContractNo;

/*
* Set the season input to defaultValue in zzzapp_default_values
*
*/
function nuAfterLoad(){
    $('select[id="season"]').val(window.defaultContractSeason);
    $('select[id="season"]').selectmenu('refresh');
}


/*
* Show div of previous page in regard to current page
*
*/
function nuBeforeBack(){
	
	if($('div[id="results"]').css('display') == 'none' && $('div[id="results-single"]').css('display') == 'none' && $('div[id="criteria"]').css('display') == 'none') {
        backToSingleContractResults();
        return false;
    } else if($('div[id="results"]').css('display') == 'none' && $('div[id="criteria"]').css('display') == 'none') {
        backToContractResults();
        return false;
    } else if($('div[id="criteria"]').css('display') == 'none') {
        backToContractCriteria();
        return false;
    }
	
    return true;
}

/*
* Ajax call to server to get contract information based on criteria
*
*/
function getContracts(){

    if($("input[name*=radio-choice]:checked").length == 0){
        nuDialogue('contract_no_product');
        return false;
    }

    window.loadDialog = nuLoadDialogue(function(){
        window.reportCancelled = true;
    });
	
    var product = '';
	$("input[name*=radio-choice]:checked").each(function() {
        product = $(this).val();
    });
	
    var season = $('select[id="season"]').val();
	
    nuAjax(
        nuConfigAppServerURL,
        nuLoadContractsSuccess,
        nuLoadContractsFailure,
        {
            json: JSON.stringify({
                action: 'getContracts',
                deviceID: window.nuLocalState.deviceID,
                data: {
                    authToken: window.nuLocalState.authToken,
                    product: product,
					season: season
                },
            })
        }
    );

}

/*
* Contract results have been returned
* Display results in contract div
*
*/
function nuLoadContractsSuccess(response){
    window.loadDialog.close();
	if(!window.reportCancelled){
		$('div[id="criteria"]').css('display','none');
		$('div[id="contract-results"]').html('');
		$('div[id="results"]').css('display','');
		var tableHTML = '';
		if(response.data.contracts.length > 0) {
			
			globalContractArray = response.data.contracts;
			
			tableHTML = tableHTML + '<table data-role="table" class="contract-results-breakpoint ui-shadow table-stroke table-stripe" style="margin-bottom: 30px !important;">' +
			'<tbody>';
			
			for (var k = 0; k < response.data.contracts.length; k++) {

				var contractNumber  = response.data.contracts[k].number;
				var contractDetails = nuFormatDate('yy-mm-dd', 'dd-M-yy', response.data.contracts[k].date);
				contractDetails += ', ' + response.data.contracts[k].grade;
				contractDetails += ', ' + response.data.contracts[k].quantity + 'mt';
				
				tableHTML = tableHTML + '<tr data-vclick="showSingleContract('+k+');">' +
						'<td>' +
							'<h3 style="text-align: center; margin-bottom: 0px;">' + contractNumber + '</h3>' +
							'<hr style="height:1pt; visibility:hidden;" />' +
							'<h4 style="text-align: center; font-weight:normal; margin-top: 0px;">' + contractDetails + '</h4>' +
						'</td>' +
					'</tr>';	
			}
			
			tableHTML = tableHTML + '</tbody></table>';
		} else {
			tableHTML = '<h4 align="center">'+DefaultMessages.contract_no_data+'</h4>';
		}
		
		$('div[id="contract-results"]').append(tableHTML);
		$('table').table();
        $(":mobile-pagecontainer").pagecontainer("getActivePage").trigger("create");
	} else {
        window.reportCancelled = false;
    }
}

/*
* Display error message on failed response
*
*/
function nuLoadContractsFailure(){
    window.loadDialog.close();
    window.reportCancelled = false;
}

/*
* Show single contract results in single results div
*
*/
function showSingleContract(contractRow) {
    currentSelectedContractNo = contractRow;
	$('div[id="results"]').css('display','none');
	$('div[id="single-contract-result"]').html('');
	$('div[id="results-single"]').css('display','');
	var tableHTML = '';
	tableHTML = tableHTML + '<table id="contractDetailsTable" data-role="table" class="contract-results-breakpoint ui-shadow table-stroke table-stripe" style="margin-bottom: 30px !important;">' +
		'<thead>' +
		'<tr>' +
		'<th colspan="2"><h3 align="center">Contract ' + globalContractArray[contractRow].number + '</h3></th>' +
		'</tr>' +
		'</thead><tbody>';
	tableHTML = tableHTML + '<tr>' +
		'<td style="width:100px;"><b>Status </b></td><td>' + globalContractArray[contractRow].status + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Date </b></td><td>' + nuFormatDate('yy-mm-dd', 'dd-M-yy', globalContractArray[contractRow].date) + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Buyer </b></td><td>' + globalContractArray[contractRow].name + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Season </b></td><td>' + globalContractArray[contractRow].season + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Product </b></td><td>' + globalContractArray[contractRow].product + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Grade </b></td><td>' + globalContractArray[contractRow].grade + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Quantity </b></td><td>' + globalContractArray[contractRow].quantity + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Supplied </b></td><td>' + globalContractArray[contractRow].supplied + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Remaining </b></td><td>' + globalContractArray[contractRow].remaining + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Price </b></td><td>' + globalContractArray[contractRow].price + '</td>' + '<tr></tr>' +
		'<td style="width:100px;"><b>Terms </b></td><td>' + globalContractArray[contractRow].terms + '</td>' + '<tr></tr>' +
		'</tr>';
	tableHTML = tableHTML + '</tbody></table>';
    // Hide old show loads button, instead show the deliveries pdf from the contract record in nuBuilder
    //var buttonHTML = '<button id="contractLoadReportButton" data-vclick="getContractLoads(' + globalContractArray[contractRow].number + ');" class="action-button">Load Report</button>';
    var delivery_report_criteria_str = '{contract_id: \''+globalContractArray[contractRow].contract_id+'\'}';
    var buttonHTML = '<button id="contractDisplayLoadReportButton" data-vclick="nuDownloadReportPDF(globalContractArray['+contractRow+'].delivery_report_code, '+delivery_report_criteria_str+', \'contract_deliveries.pdf\');" class="action-button">Display Load Report</button>';
    var emailButtonHTML = '<button id="contractEmailLoadReportButton" data-vclick="emailDeliveryReport();" class="action-button">Email Load Report</button>';
	$('div[id="single-contract-result"]').append(tableHTML);
	$('table[id="contractDetailsTable"]').table();
    $('div[id="single-contract-result"]').append(buttonHTML);
    $('div[id="single-contract-result"]').append(emailButtonHTML);
    $(":mobile-pagecontainer").pagecontainer("getActivePage").trigger("create");
    $.mobile.silentScroll(0);
	
}

function emailDeliveryReport(){

    window.loadDialog = nuLoadDialogue(function(){
        window.reportCancelled = true;
    });

    nuAjax(
        nuConfigAppServerURL,
        nuGetEmailSuccess,
        nuGetEmailFailure,
        {
            json: JSON.stringify({
                action: 'getUsersEmail',
                deviceID: window.nuLocalState.deviceID,
                data: {
                    authToken: window.nuLocalState.authToken
                }
            })
        }
    );
}

/*
 * Show email confirm prompt
 *
 */
function nuGetEmailSuccess(response){
    window.loadDialog.close();
    if(!window.reportCancelled){
        var defaultEmail = response.data.email;
        $.confirm({
            title: DefaultMessages.harvest_deliveries_email_popup_title,
            content: '<input type="email" id="email_to" placeholder="Email" value="'+defaultEmail+'" style="width:100%;" /><p class="text-danger" style="display:none;">'+DefaultMessages.harvest_deliveries_invalid_email+'</p>',
            confirmButtonClass: 'nudialogue-button',
            cancelButtonClass: 'nudialogue-button',
            confirm: function(){
                if(this.$b.find('input[id="email_to"]').val() == '' || !nuValidateEmail(this.$b.find('input[id="email_to"]').val())){
                    this.$b.find('.text-danger').show();
                    return false;
                } else {
                    emailContractDeliveryPDF(this.$b.find('input[id="email_to"]').val());
                }
            }
        });
    } else {
        window.reportCancelled = false;
    }
}

/*
 * Report failure via error dialog
 *
 */
function nuGetEmailFailure(){
    window.loadDialog.close();
    window.reportCancelled = false;
    nuDialogue('network_error');
}

function emailContractDeliveryPDF(email){
    window.loadDialog = nuLoadDialogue(function(){
        window.reportCancelled = true;
    });
	
	var reportData = {};
	/* core variables*/
	reportData['authToken'] = window.nuLocalState.authToken;
	reportData['email'] = email;
	reportData['report_code'] = globalContractArray[currentSelectedContractNo].delivery_report_code;
	reportData['type'] = 'pdf';
	reportData['filename'] = 'Contract_' + globalContractArray[currentSelectedContractNo].number + '_Report';
	
	/* report specific variables*/
	reportData['contract_id'] = globalContractArray[currentSelectedContractNo].contract_id;
	
    nuEmailReport(reportData, nuContractDeliveryPDFSuccess, nuContractDeliveryPDFFailure);
}

function nuContractDeliveryPDFSuccess(response){
    window.loadDialog.close();
    if(!window.reportCancelled){
        nuDialogue('contract_delivery_email_success');
    } else {
        window.reportCancelled = false;
    }
}

function nuContractDeliveryPDFFailure(){
    window.loadDialog.close();
    window.reportCancelled = false;
    nuDialogue('network_error');
}


/*
* Get Loads for selected single contract
*
*/
function getContractLoads(contractNumber){
    window.loadDialog = nuLoadDialogue(function(){
        window.reportCancelled = true;
    });
	
    nuAjax(
        nuConfigAppServerURL,
        nuLoadContractLoadsSuccess,
        nuLoadContractLoadsFailure,
        {
            json: JSON.stringify({
                action: 'getContractsLoads',
                deviceID: window.nuLocalState.deviceID,
                data: {
                    authToken: window.nuLocalState.authToken,
                    contract: contractNumber
                },
            })
        }
    );

}

/*
* Recieve response and display results in load results div
*
*/
function nuLoadContractLoadsSuccess(response){
    window.loadDialog.close();
	
	if(!window.reportCancelled){
		$('div[id="results-single"]').css('display','none');
		$('div[id="contract-load-result"]').html('');
		$('div[id="results-loads"]').css('display','');

		var tableHTML = '';
		
		if(response.data.contractLoads.length > 0) {
						
			tableHTML = tableHTML + '<table id="loadDetailsTable" data-role="table" class="contract-results-breakpoint ui-shadow table-stroke" style="margin-bottom: 0px !important;">' +
			'<tbody>';
			
			for (var k = 0; k < response.data.contractLoads.length; k++) {

				var loadNumber  = response.data.contractLoads[k].number;
				var loadDetails = nuFormatDate('yy-mm-dd', 'dd-M-yy', response.data.contractLoads[k].date);
				loadDetails += ', ' + response.data.contractLoads[k].net + 'mt';
				loadDetails += ', ' + response.data.contractLoads[k].truck;
				loadDetails += ', ' + response.data.contractLoads[k].grade;
				
				tableHTML = tableHTML + '<tr>' +
						'<td>' +
							'<h3 style="text-align: center; margin-bottom: 0px; height:15px;">' + loadNumber + '</h3>' +
							'<hr style="height:1pt; visibility:hidden;" />' +
							'<h4 style="text-align: center; font-weight:normal; margin-top: 0px; margin-bottom: 0px; height:13px;">' + loadDetails + '</h4>';
                if(response.data.contractLoads[k].sample.length > 0){
                    tableHTML = tableHTML + '<table data-role="table" align="center" style="margin-top:10px;padding-bottom:20px;"><tbody>';
                    for(var j = 0; j < response.data.contractLoads[k].sample.length; j++) {
                        tableHTML = tableHTML +
                            '<tr>'+
                            '<td>'+ response.data.contractLoads[k].sample[j] +'</td>'+
                            '<td style="text-align:right;">'+ response.data.contractLoads[k].value[j] +'</td>'+
                            '</tr>';
                    }
                    tableHTML = tableHTML + '</tbody></table>';
                }
							
				tableHTML = tableHTML + '</td>'
					+ '</tr>';	
			}
			
			tableHTML = tableHTML + '</tbody></table>';
			
		} else {
			tableHTML = '<h4 align="center">'+DefaultMessages.contract_load_no_data+'</h4>';
		}
		
		$('div[id="contract-load-result"]').append(tableHTML);
		$('table[id="loadDetailsTable"]').table();
		
	} else {
        window.reportCancelled = false;
    }
}

/*
* Display error message on failure
*
*/
function nuLoadContractLoadsFailure(){
    window.loadDialog.close();
    window.reportCancelled = false;
}

/*
* Return to first criteria page
*
*/
function backToContractCriteria(){
    $('div[id="results"]').css('display','none');
    $('div[id="criteria"]').css('display','');
}

/*
* Return to contract results page
*
*/
function backToContractResults(){
    $('div[id="results-single"]').css('display','none');
    $('div[id="results"]').css('display','');
}

/*
* Return single contract page
*
*/
function backToSingleContractResults(){
    $('div[id="results-loads"]').css('display','none');
    $('div[id="results-single"]').css('display','');
}