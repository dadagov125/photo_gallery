package com.example.demo.controllers;

import com.example.demo.services.FileStorage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import java.util.stream.Collectors;
@Controller
public class IndexController {

    private FileStorage fileStorage;

    @Autowired
    public IndexController(FileStorage fileStorage) {
        this.fileStorage = fileStorage;
    }


    @RequestMapping(value = {"/", "index"}, method = RequestMethod.GET)
    public String index(Model model){

        model.addAttribute("files", fileStorage.fileList());
        return "index";
    }



}


