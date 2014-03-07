<?php
$action = (!empty($_REQUEST['action'])) ? $_REQUEST['action'] : null;
$patch = (!empty($_REQUEST['patch'])) ? 'data/book2' : 'data/book1';
$url_array = $_GET;
$page = (!empty($_REQUEST['page'])) ? $_REQUEST['page'] : 1;


try{
    include_once('FileView.php');
    $FileView = new FileView($patch);

    switch($action){
        case 'pack':
            ajax_print($FileView->getPack($page, $pack));
            break;
        default:
            ajax_print($FileView->getBaseData($page));
    }
} catch( Exception $e ){
    ajax_print( 'Exception: '. $e->getMessage());
}

function ajax_print($data){
//    echo '<pre>';
//    echo print_r($data, JSON_PRETTY_PRINT);
    echo json_encode($data);
//    echo '</pre>';
}