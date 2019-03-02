package com.example.demo.controllers;


import com.example.demo.services.FileStorage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.InputStreamResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.io.InputStream;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
public class FileController {

    @Value("${file.storage.path}")
    private String uploadsPath;

    private FileStorage fileStorage;

    @Autowired
    public FileController(FileStorage fileStorage) {
        this.fileStorage = fileStorage;
    }


    @RequestMapping(value = "/file/upload", method = RequestMethod.POST)
    public List<String> upload(@RequestParam("file") MultipartFile[] files) throws Exception {

        if (files.length==0) {
            throw new Exception();
        }

        Arrays.stream(files).forEach((file)->{
            try {
                fileStorage.upload(file.getInputStream(), file.getOriginalFilename());
            } catch (IOException e) {

            }
        });





        return fileStorage.fileList();
    }

    @RequestMapping(value = "/file/download/{filename}", method = RequestMethod.GET)
    @ResponseBody
    public ResponseEntity download(@PathVariable("filename") String filename) throws NoSuchFieldException, IOException {

        InputStream inputStream = fileStorage.download(filename);

        return ResponseEntity
                .ok()
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"" + filename + "\"")
                .body(new InputStreamResource(inputStream));

    }


    @RequestMapping(value = "/file/list", method = RequestMethod.GET)
    public List<String> fileList() {
        return fileStorage.fileList();
    }


    @RequestMapping(value = "/file/sort", method = RequestMethod.POST)
    public List<String>  reSort(@RequestBody Map<String, String> filenames){
        fileStorage.reSort(filenames);
        return fileStorage.fileList();
    }

    @RequestMapping(value = "/file/delete/{filename}", method = RequestMethod.DELETE)
    public List<String>  delete(@PathVariable("filename") String filename){
        fileStorage.delete(filename);
        Map<String, String> map=new HashMap<>();

       final List<String> list= fileStorage.fileList();

        list.forEach((e)->{
            int number=list.indexOf(e)+1;
            map.put(String.valueOf(number), e);
        });

        fileStorage.reSort(map);


        return fileStorage.fileList();
    }




}
