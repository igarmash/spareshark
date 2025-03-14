package com.teko.spareshark;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;

@SpringBootApplication
@EnableJpaAuditing
public class SparesharkApplication {

	public static void main(String[] args) {
		SpringApplication.run(SparesharkApplication.class, args);
	}

}
