package com.example.demo.configs;

import com.example.demo.services.FileStorage;
import com.example.demo.services.FileStorageImpl;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class Config {

    @Bean
    public FileStorage fileStorage(){
        return new FileStorageImpl();
    }
}
