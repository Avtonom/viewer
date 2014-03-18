<?php
/**
 * Класс для сканирования дирректории и вывода информации для просмотра картинок в ней
 */
class FileView
{
    /**
     * Варианты сортировки файлов
     */
    const FILE_SORT_NAME = 1, // Сортирует массив, используя алгоритм "natural order"
          FILE_SORT_TIME = 2; // Сортирует массив, используя числовое сравнение элементов

    /**
     * @var string Путь к папке для сканирования
     */
    protected $base_patch;

    /**
     * @var array Массив названий файлов
     */
    protected $data_files;

    /**
     * @param string $base_patch Путь к папке для сканирования
     * @param int $sort_type Тип сортировки файлов
     *
     * @throws Exception
     */
    public function __construct($base_patch, $sort_type=self::FILE_SORT_NAME){
        if(!is_dir($base_patch)){
            throw new Exception('Patch "'.$base_patch.'" is not dir!');
        }
        $this->base_patch = $base_patch;
        $this->data_files = $this->scanBasePatch($base_patch, $sort_type);
    }

    /**
     * Получение массива данных для просмотра папки
     *
     * @param int $page_num номер активной страницы
     * @return array Массив данных для просмотра папки
     *
     * @throws Exception
     */
    public function getBaseData($page_num){
        $page_count = sizeof($this->data_files);
        if(!is_numeric($page_num) || $page_num < 1 || $page_num > $page_count || !array_key_exists($page_num, $this->data_files)){
            throw new Exception('Page num "'.$page_num.'" is incorrect');
        }
        $return_data = array(
            'page_num' => $page_num,
            'page_count' => $page_count,
            'base_patch' => $this->base_patch,
            'data_files' => $this->data_files,
        );
        return $return_data;
    }

    /**
     * Сканирование папки на наличие фалов
     * @param string $patch Путь к папке для сканирования
     * @param int $sort_type Тип сортировки файлов
     *
     * @return array Массив названий файлов
     */
    protected function scanBasePatch($patch, $sort_type=self::FILE_SORT_NAME) {
       $result = array();

       $scan_patch = scandir($patch);
       foreach ($scan_patch as $value) {
          if(!in_array($value, array(".", ".."))) {
             if (!is_dir($patch . DIRECTORY_SEPARATOR . $value)) {
                 if($sort_type == self::FILE_SORT_NAME){
                     if(!$result){
                         $result[1] = $value;
                     } else {
                         $result[] = $value;
                     }
                 } else {
                     $result[$value] = filemtime($patch.'/'.$value);
                 }
             }
          }
       }
       if($sort_type == self::FILE_SORT_NAME){
           natsort($result);
       } else {
           asort($result, SORT_NUMERIC);
           $result = array_keys($result);
       }
       return $result;
    }
}