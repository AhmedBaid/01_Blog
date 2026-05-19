FRONTEND_DIR=frontend
BACKEND_DIR=backend

.PHONY: frontend backend both clean

frontend:
	clear && cd $(FRONTEND_DIR) && npm install && ng serve

backend:
	clear && cd $(BACKEND_DIR) && ./mvnw spring-boot:run

both:
	make -j2 frontend backend

clean:
	clear && cd $(BACKEND_DIR) && ./mvnw clean