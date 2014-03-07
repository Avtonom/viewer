<?php
/**
 * 
 */
class FileView {

    protected $base_patch;
    protected $data_files;

    public function __construct($base_patch){
        if(!is_dir($base_patch)){
            throw new Exception('Patch "'.$base_patch.'" is not dir!');
        }
        $this->base_patch = $base_patch;
        $this->data_files = $this->scanBasePatch($base_patch);
    }

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

    public function getPack($page_num, $pack_count){
        $page_count = sizeof($this->data_files);
        if(!is_numeric($page_num) || $page_num < 1 || $page_num > $page_count || !array_key_exists($page_num, $this->data_files)){
            throw new Exception('Page num "'.$page_num.'" is incorrect');
        }
        if(!is_numeric($pack_count) || $pack_count < 2 || ($page_num + $pack_count) > $page_count){
            throw new Exception('Pack count "'.$pack_count.'" is incorrect. Because: Page num "'.$page_num.'", Page count "'.$page_count.'"');
        }
        $return_data = array_intersect_key($this->data_files, array_flip(range($page_num, $page_num + $pack_count)));
        return $return_data;
    }

    protected function scanBasePatch($patch) {
       $result = array();

       $scan_patch = scandir($patch);
       foreach ($scan_patch as $key => $value) {
          if(!in_array($value, array(".", ".."))) {
             if (!is_dir($patch . DIRECTORY_SEPARATOR . $value)) {
                 if(!$result){
                     $result[1] = $value;
                 } else {
                     $result[] = $value;
                 }
             }
          }
       }

       return $result;
    }
}