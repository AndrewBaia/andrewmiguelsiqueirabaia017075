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
    private final MinioClient minioClientPublic;

    @Value("${minio.bucket-name}")
    private String bucketName;

    public MinioService(
            @Value("${minio.endpoint}") String endpoint,
            @Value("${minio.public-endpoint}") String publicEndpoint,
            @Value("${minio.access-key}") String accessKey,
            @Value("${minio.secret-key}") String secretKey
    ) {
        this.minioClient = MinioClient.builder()
                .endpoint(endpoint)
                .credentials(accessKey, secretKey)
                .region("us-east-1")
                .build();
        
        this.minioClientPublic = MinioClient.builder()
                .endpoint(publicEndpoint)
                .credentials(accessKey, secretKey)
                .region("us-east-1")
                .build();
    }

    /**
     * Faz upload de um arquivo para o bucket.
     */
    public void uploadFile(String objectKey, byte[] data, String contentType) throws Exception {
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
     * Gera uma URL pré-assinada para download temporário usando o cliente público.
     */
    public String generatePresignedUrl(String objectKey, int expirationMinutes) throws Exception {
        return minioClientPublic.getPresignedObjectUrl(
                GetPresignedObjectUrlArgs.builder()
                        .method(Method.GET)
                        .bucket(bucketName)
                        .object(objectKey)
                        .expiry(expirationMinutes, TimeUnit.MINUTES)
                        .build()
        );
    }

    /**
     * Baixa o arquivo completo do bucket.
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
