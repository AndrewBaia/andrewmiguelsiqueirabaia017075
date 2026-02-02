package com.seplag.artistalbum.domain.service;

import io.minio.*;
import io.minio.http.Method;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.ByteArrayInputStream;
import java.util.concurrent.TimeUnit;

/**
 * Serviço responsável por operações com arquivos no MinIO.
 */
@Service
public class MinioService {

    private final MinioClient minioClient;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public MinioService(
            @Value("${minio.endpoint}") String endpoint,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey
    ) {
        this.minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .region("us-east-1")
                .build();
    }

    /**
     * Faz upload de um arquivo para o bucket.
     * @param objectKey Nome do objeto no bucket
     * @param data Conteúdo do arquivo
     * @param contentType Tipo de conteúdo (MIME type)
     * @throws Exception caso ocorra erro ao fazer upload
     */
    public void uploadFile(String objectKey, byte[] data, String contentType) throws Exception {
        // Garantir que o bucket exista antes de enviar arquivo
        garantirBucket();

        minioClient.putObject(
                PutObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .stream(new ByteArrayInputStream(data), data.length, -1)
                        .contentType(contentType)
                        .build()
        );
    }

    /**
     * Remove um arquivo do bucket.
     * @param objectKey Nome do objeto a ser removido
     * @throws Exception caso ocorra erro ao remover
     */
    public void deleteFile(String objectKey) throws Exception {
        minioClient.removeObject(
                RemoveObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .build()
        );
    }

    /**
     * Gera uma URL pré-assinada para download temporário.
     * @param objectKey Nome do objeto
     * @param expirationSeconds Tempo de expiração da URL em segundos
     * @return URL pré-assinada acessível externamente
     * @throws Exception caso ocorra erro na geração da URL
     */
    public String generatePresignedUrl(String objectKey, int expirationSeconds) throws Exception {
        String url = minioClient.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectKey)
                        .expiry(expirationSeconds, TimeUnit.SECONDS)
                        .build()
        );

        // Substitui o hostname interno do Docker para acesso externo pelo frontend
        if (url.contains("minio:9000")) {
            url = url.replace("minio:9000", "localhost:9000");
        }

        return url;
    }

    /**
     * Baixa o arquivo completo do bucket.
     * @param objectKey Nome do objeto
     * @return Array de bytes do arquivo
     * @throws Exception caso ocorra erro ao baixar
     */
    public byte[] downloadFile(String objectKey) throws Exception {
        try (var stream = minioClient.getObject(
                GetObjectArgs.builder()
                        .bucket(bucketName)
                        .object(objectKey)
                        .build())) {
            return stream.readAllBytes();
        }
    }

    /**
     * Verifica se um arquivo existe no bucket.
     * @param objectKey Nome do objeto
     * @return true se existe, false se não existe
     * @throws Exception caso ocorra erro na verificação
     */
    public boolean fileExists(String objectKey) throws Exception {
        try {
            minioClient.statObject(
                    StatObjectArgs.builder()
                            .bucket(bucketName)
                            .object(objectKey)
                            .build()
            );
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Garante que o bucket existe, criando-o caso não exista.
     * @throws Exception caso ocorra erro na criação do bucket
     */
    private void garantirBucket() throws Exception {
        boolean existe = minioClient.bucketExists(
                BucketExistsArgs.builder()
                        .bucket(bucketName)
                        .build()
        );

        if (!existe) {
            minioClient.makeBucket(
                    MakeBucketArgs.builder()
                            .bucket(bucketName)
                            .build()
            );
        }
    }
}
