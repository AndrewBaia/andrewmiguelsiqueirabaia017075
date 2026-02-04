package com.seplag.artistalbum.infrastructure.config;

import io.github.bucket4j.Bucket;
import io.github.bucket4j.ConsumptionProbe;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

@Component
public class InterceptadorLimiteTaxa implements HandlerInterceptor {

    private final Bucket bucket;

    public InterceptadorLimiteTaxa(Bucket bucket) {
        this.bucket = bucket;
    }

    @Override
    public boolean preHandle(HttpServletRequest requisicao, HttpServletResponse resposta, Object manipulador) throws Exception {
        ConsumptionProbe sonda = bucket.tryConsumeAndReturnRemaining(1);

        if (sonda.isConsumed()) {
            resposta.addHeader("X-Rate-Limit-Remaining", String.valueOf(sonda.getRemainingTokens()));
            return true;
        } else {
            long aguardarReabastecimento = sonda.getNanosToWaitForRefill() / 1_000_000_000;
            resposta.addHeader("X-Rate-Limit-Retry-After-Seconds", String.valueOf(aguardarReabastecimento));
            resposta.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            resposta.setContentType("application/json;charset=UTF-8");
            resposta.getWriter().write("{\"mensagem\": \"Rate limit de 10 requisições alcançada, tente novamente em 1 minuto\"}");
            return false;
        }
    }
}


