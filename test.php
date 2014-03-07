<html>
<a href="?">Сбросить</a> ||
<?php
$action = (!empty($_REQUEST['action'])) ? $_REQUEST['action'] : null;
$patch = (!empty($_REQUEST['patch'])) ? 'data/book2' : 'data/book1';
$url_array = $_GET;
$page = (!empty($_REQUEST['page'])) ? $_REQUEST['page'] : 1;

$patch_url = $url_array;
if(!empty($_REQUEST['patch'])) {
    unset($patch_url['patch']);
} else {
    $patch_url['patch'] = 2;
}
echo '<a href="?'.http_build_query($patch_url).'">Другой каталог</a> ||';

$page_url = $url_array;
$page_url['page'] = ($page<2) ? 1 : $page-1;
echo '<a href="?'.http_build_query($page_url).'">← Предыдущая страница →</a> ||';
$page_url['page'] = $page+1;
echo '<a href="?'.http_build_query($page_url).'">Следующая страница →</a> ||';

$pack_url = $url_array;
$pack_url['action'] = 'pack';
$pack = (!empty($pack_url['pack'])) ? $pack_url['pack'] : 4;
$pack_url['pack'] = $pack;
echo '<a href="?'.http_build_query($pack_url).'">Несколько страниц (Начиная с '.$page.' + '.$pack.')</a> ||';
echo '<br/><hr>';
echo 'Страница: '.$page.'<hr>';

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
    echo 'Exception: '. $e->getMessage();
}

function ajax_print($data){
    echo '<pre>';
    echo print_r($data, JSON_PRETTY_PRINT);
//    echo json_encode($data, JSON_PRETTY_PRINT);
    echo '</pre>';
}