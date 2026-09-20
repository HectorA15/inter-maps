package com.intermaps;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class InterMapsApplication {

	public static void main(String[] args) {

		SpringApplication.run(InterMapsApplication.class, args);

	}

}
