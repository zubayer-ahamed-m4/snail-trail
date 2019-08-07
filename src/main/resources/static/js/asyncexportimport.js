$(document).ready(function(){

	var table = $('#example').DataTable({
		"rowReorder" : true,
//		"paging" : false,
//		"ordering" : false,
//		"info" : false
//		"ajax": "http://localhost:8080/table/student",
//		"columns" : [
//			{"data" : "id"},
//			{"data" : "name"},
//			{"data" : "role"}
//		]
//		"createdRow": function(row, data, dataIndex){
//			console.log(row);
//			//console.log(data);
//			//console.log(dataIndex);
//			$(row).attr('id', data.id);
//		},
		
	});

	/*table.on( 'row-reorder', function ( e, diff, edit ) {
        var result = 'Reorder started on row: '+edit.triggerRow.data()[1]+'<br>';
 
        for ( var i=0, ien=diff.length ; i<ien ; i++ ) {
            var rowData = table.row( diff[i].node ).data();
 
            result += rowData[1]+' updated to be in position '+
                diff[i].newData+' (was '+diff[i].oldData+')<br>';
        }
 
       $('#result').html( 'Event result:<br>'+result );
    } );*/
	
	$.ajax({
		url :  "http://localhost:8080/table/student",
		type : 'GET',
		dataType : 'json',
		beforeSend: function(xhr) {
			xhr.setRequestHeader("Accept", "application/json");
			xhr.setRequestHeader("Content-Type", "application/json");
		},
		success : function(data){
			console.log({data});
			data.data.forEach(function(item){
				table.row.add([
					'<button class="btn btn-default drag-button">=</button>',
					item.name,
					item.id,
					item.role
				]).draw(true);
			});
			
			$('tbody').sortable();
		},
		error: function(jqXHR, status, errorThrown) {   
			console.log(status);
		},
	})

	
})
