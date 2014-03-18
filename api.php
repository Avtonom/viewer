<?php
header("Content-Type: text/html;charset=utf-8");// AJAX to IE 7+

$patch = (!empty($_REQUEST['patch'])) ? 'data/book2' : 'data/book1';
$page = (!empty($_REQUEST['page'])) ? $_REQUEST['page'] : 1;

try{
    include_once('FileView.php');
    $FileView = new FileView($patch);

    ajax_print($FileView->getBaseData($page));
} catch( Exception $e ){
    ajax_print( 'Exception: '. $e->getMessage());
}

function ajax_print($data){
    echo json_encode($data);
}