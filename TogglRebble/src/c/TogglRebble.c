#include <pebble.h>

static Window *s_window;
static TextLayer *s_text_layer;

const uint32_t inbox_size = 64;
const uint32_t outbox_size = 256;

static void request_data(int key) {
  // Declare the dictionary's iterator
  DictionaryIterator *out_iter;

  // Prepare the outbox buffer for this message
  AppMessageResult result = app_message_outbox_begin(&out_iter);

  if(result == APP_MSG_OK) {

    dict_write_int(out_iter, MESSAGE_KEY_RequestData, &key, sizeof(int), true);
  }

  // Send this message
  result = app_message_outbox_send();

  // Check the result
  if(result != APP_MSG_OK) {
    APP_LOG(APP_LOG_LEVEL_ERROR, "Error sending the outbox: %d", (int)result);
  }
}

static void inbox_received_callback(DictionaryIterator *iter, void *context) {
  APP_LOG(APP_LOG_LEVEL_DEBUG, "Message Recieved");

  Tuple *js_ready_tuple = dict_find(iter, MESSAGE_KEY_JSReady);
  if(js_ready_tuple) {
    int32_t js_ready = js_ready_tuple->value->int32;
    static char s_buffer[64];
    snprintf(s_buffer, sizeof(s_buffer), "JSReady: %d", (int)js_ready);
    text_layer_set_text(s_text_layer, s_buffer);

    request_data(MESSAGE_KEY_ApiToken);
  }

  Tuple *api_token_tuple = dict_find(iter, MESSAGE_KEY_ApiToken);
  if(api_token_tuple) {
    // This value was stored as JS String, which is stored here as a char string
    char *api_token = api_token_tuple->value->cstring;

    // Use a static buffer to store the string for display
    static char s_buffer[64];
    snprintf(s_buffer, sizeof(s_buffer), "api_token: %s", api_token);

    // Display in the TextLayer
    text_layer_set_text(s_text_layer, s_buffer);

    request_data(MESSAGE_KEY_GetRunningTimeEntry);
  }
}

static void inbox_dropped_callback(AppMessageResult reason, void *context) {
  // A message was recioeved, but had to be dropped
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message dropped. Reason: %d", (int)reason);
}

static void outbox_sent_callback(DictionaryIterator *iter, void *context) {
  // The message just sent has been successfully delivered

}

static void outbox_failed_callback(DictionaryIterator *iter, AppMessageResult reason, void *context) {
  // The message just sent failed to be delivered
  APP_LOG(APP_LOG_LEVEL_ERROR, "Message send failed. Reason: %d", (int)reason);
}

static void prv_select_click_handler(ClickRecognizerRef recognizer, void *context) {
  text_layer_set_text(s_text_layer, "Select");
}

static void prv_up_click_handler(ClickRecognizerRef recognizer, void *context) {
  text_layer_set_text(s_text_layer, "Up");
}

static void prv_down_click_handler(ClickRecognizerRef recognizer, void *context) {
  text_layer_set_text(s_text_layer, "Down");
}

static void prv_click_config_provider(void *context) {
  window_single_click_subscribe(BUTTON_ID_SELECT, prv_select_click_handler);
  window_single_click_subscribe(BUTTON_ID_UP, prv_up_click_handler);
  window_single_click_subscribe(BUTTON_ID_DOWN, prv_down_click_handler);
}

static void prv_window_load(Window *window) {
  Layer *window_layer = window_get_root_layer(window);
  GRect bounds = layer_get_bounds(window_layer);

  s_text_layer = text_layer_create(GRect(0, 72, bounds.size.w, 20));
  text_layer_set_text(s_text_layer, "Press a button");
  text_layer_set_text_alignment(s_text_layer, GTextAlignmentCenter);
  layer_add_child(window_layer, text_layer_get_layer(s_text_layer));
}

static void prv_window_unload(Window *window) {
  text_layer_destroy(s_text_layer);
}

static void prv_init(void) {
  s_window = window_create();
  window_set_click_config_provider(s_window, prv_click_config_provider);
  window_set_window_handlers(s_window, (WindowHandlers) {
    .load = prv_window_load,
    .unload = prv_window_unload,
  });
  const bool animated = true;
  window_stack_push(s_window, animated);
}

static void prv_deinit(void) {
  window_destroy(s_window);
}

int main(void) {
  prv_init();

  APP_LOG(APP_LOG_LEVEL_DEBUG, "Done initializing, pushed window: %p", s_window);

  // Open AppMessage
  app_message_open(inbox_size, outbox_size);

  // Register to be notified about inbox received events
  app_message_register_inbox_received(inbox_received_callback);

  // Register to be notified about inbox dropped events
  app_message_register_inbox_dropped(inbox_dropped_callback);

  // Register to be notified about outbox sent events
  app_message_register_outbox_sent(outbox_sent_callback);
  
  // Register to be notified about outbox failed events
  app_message_register_outbox_failed(outbox_failed_callback);

  app_event_loop();
  prv_deinit();
}
