package com.seplag.artistalbum.domain.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.seplag.artistalbum.domain.model.Regional;
import com.seplag.artistalbum.domain.port.RegionalRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;

@Service
public class RegionalSyncService {

    private static final Logger logger = LoggerFactory.getLogger(RegionalSyncService.class);

    private final WebClient webClient;
    private final RegionalRepository regionalRepository;
    private final ObjectMapper objectMapper;

    @Value("${external.api.police-regionais}")
    private String policeRegionaisUrl;

    public RegionalSyncService(WebClient.Builder webClientBuilder,
                              RegionalRepository regionalRepository,
                              ObjectMapper objectMapper) {
        this.webClient = webClientBuilder.build();
        this.regionalRepository = regionalRepository;
        this.objectMapper = objectMapper;
    }

    @Scheduled(fixedRate = 3600000) // Executa a cada hora
    public void sincronizarRegionais() {
        logger.info("Iniciando sincronização das regionais com a API da Polícia");

        try {
            List<Map<String, Object>> regionaisExternas = buscarRegionaisExternas();

            if (regionaisExternas != null && !regionaisExternas.isEmpty()) {
                sincronizarDadosRegionais(regionaisExternas);
                logger.info("Sincronização das regionais concluída com sucesso");
            } else {
                logger.warn("Nenhum dado de regionais recebido da API externa");
            }
        } catch (Exception e) {
            logger.error("Erro durante a sincronização das regionais", e);
        }
    }

    @Transactional
    public void sincronizarDadosRegionais(List<Map<String, Object>> regionaisExternas) {
        // Buscar regionais ativas atualmente no banco de dados
        List<Regional> regionaisAtivasAtuais = regionalRepository.findByAtivoTrue();
        Set<String> nomesAtivosAtuais = regionaisAtivasAtuais.stream()
                .map(Regional::getNome)
                .collect(Collectors.toSet());

        // Buscar nomes vindos da fonte externa
        Set<String> nomesExternos = regionaisExternas.stream()
                .filter(regional -> regional.containsKey("nome") && regional.get("nome") != null)
                .map(regional -> regional.get("nome").toString())
                .collect(Collectors.toSet());

        // Processar cada regional vinda da API externa
        for (Map<String, Object> regionalExterna : regionaisExternas) {
            String nome = regionalExterna.get("nome").toString();

            if (nome != null && !nome.trim().isEmpty()) {
                processarRegional(nome, nomesAtivosAtuais, nomesExternos);
            }
        }

        // Desativar regionais que não existem mais na API externa
        for (Regional regionalAtual : regionaisAtivasAtuais) {
            if (!nomesExternos.contains(regionalAtual.getNome())) {
                regionalRepository.deactivateByNome(regionalAtual.getNome());
                logger.info("Regional desativada: {}", regionalAtual.getNome());
            }
        }
    }

    private void processarRegional(String nome, Set<String> nomesAtivosAtuais, Set<String> nomesExternos) {
        if (nomesAtivosAtuais.contains(nome)) {
            // Já existe e está ativa - verifica se atributos mudaram (caso precise)
            Regional existente = regionalRepository.findByNomeAndAtivo(nome, true).orElse(null);
            if (existente != null) {
                // Para esta implementação simples, nenhum atributo adicional é verificado
                // Em um cenário mais complexo, compare os atributos necessários aqui
                return;
            }
        } else {
            // Verifica se existe uma versão inativa com o mesmo nome
            List<Regional> regionaisExistentes = regionalRepository.findByNome(nome);
            boolean possuiInativa = regionaisExistentes.stream().anyMatch(r -> !r.getAtivo());

            if (possuiInativa) {
                regionalRepository.deactivateByNome(nome);
                logger.info("Regional antiga desativada e nova será criada: {}", nome);
            }

            // Cria nova regional ativa
            Regional novaRegional = new Regional(nome, true);
            regionalRepository.save(novaRegional);
            logger.info("Nova regional criada: {}", nome);
        }
    }

    private List<Map<String, Object>> buscarRegionaisExternas() {
        try {
            Mono<String> response = webClient.get()
                    .uri(policeRegionaisUrl)
                    .retrieve()
                    .bodyToMono(String.class);

            String jsonResponse = response.block();
            return objectMapper.readValue(jsonResponse, new TypeReference<List<Map<String, Object>>>() {});
        } catch (Exception e) {
            logger.error("Erro ao buscar regionais na API externa", e);
            return null;
        }
    }

    public List<Regional> obterRegionaisAtivas() {
        return regionalRepository.findActiveOrderByNome();
    }
}
