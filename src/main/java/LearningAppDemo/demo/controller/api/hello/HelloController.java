package LearningAppDemo.demo.controller.api.hello;


import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
// ⭐️ 핵심: React(포트 3000 등)에서 오는 통신을 막지 말고 허락해라!
@CrossOrigin(origins = "*")
public class HelloController {

        @GetMapping("/api/hello")
        public String hello() {
            return "안녕! 서버와 연결이 성공했어요! 😊";
        }
    }

