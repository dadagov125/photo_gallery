package com.example.demo.services;

import org.springframework.core.io.InputStreamResource;

import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.nio.file.Path;
import java.util.List;
import java.util.Map;

public interface FileStorage {


    Path getUploadsPath(String filename);

    InputStream download(String filename) throws IOException;

    void upload(InputStream inputStream,String filename) throws IOException;

    void reSort(Map<String, String> filenames);

    boolean exist(String filename);

    void delete(String filename);

    File getFile(String filename);


    List<String> fileList();
}
