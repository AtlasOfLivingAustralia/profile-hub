package au.org.ala.profile.analytics;

import retrofit2.Call;
import retrofit2.http.Field;
import retrofit2.http.FieldMap;
import retrofit2.http.FormUrlEncoded;
import retrofit2.http.POST;

import java.util.Map;

public interface GoogleAnalyticsClient {

    @FormUrlEncoded
    @POST("collect")
    Call<Void> collect(
            @Field("v") String version,
            @Field("tid") String trackingId,
            @Field("cid") String clientId,
            @Field("t") String hitType,
            @FieldMap Map<String,String> otherParams
            );

}
